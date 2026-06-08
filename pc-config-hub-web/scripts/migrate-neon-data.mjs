import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const oldUrl = process.env.OLD_DATABASE_URL;
const newUrl = process.env.NEW_DATABASE_URL;
const backupPath =
  process.env.BACKUP_PATH ??
  path.join("..", "backups", `neon-data-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);

if (!oldUrl || !newUrl) {
  throw new Error("OLD_DATABASE_URL and NEW_DATABASE_URL are required");
}

const source = neon(oldUrl);
const target = neon(newUrl);

const tables = [
  "users",
  "password_reset_tokens",
  "import_batches",
  "pc_configurations",
  "components",
  "component_test_logs",
  "component_restoration_logs",
  "configuration_test_logs",
  "configuration_restoration_logs",
  "motherboard_details",
  "cpu_details",
  "video_card_details",
  "ram_details",
  "sound_card_details",
  "case_details",
  "case_supported_psu_types",
  "power_supply_details",
  "storage_details",
  "component_images",
  "import_rows",
  "pc_configuration_components",
  "comments",
];

const nullableReferences = [
  ["users", "approved_by_user_id"],
  ["users", "role_reviewed_by_user_id"],
  ["pc_configurations", "approved_by_user_id"],
  ["import_rows", "component_id"],
  ["components", "approved_by_user_id"],
  ["components", "import_batch_id"],
  ["components", "related_configuration_id"],
  ["comments", "approved_by_user_id"],
];

function quoteIdent(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function literal(value, column = {}) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return `'${value.toISOString().replaceAll("'", "''")}'`;
  if (Array.isArray(value)) {
    const cast = column.data_type === "ARRAY" ? `::${quoteIdent(column.udt_name.replace(/^_/, ""))}[]` : "";
    if (value.length === 0) return `ARRAY[]${cast}`;
    return `ARRAY[${value.map((item) => literal(item)).join(",")}]${cast}`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
  }
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function tableColumns(sql, table) {
  return sql`
    select column_name, data_type, udt_name
    from information_schema.columns
    where table_schema = 'public' and table_name = ${table}
    order by ordinal_position
  `;
}

async function existingTables(sql) {
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  `;
  return new Set(rows.map((row) => row.table_name));
}

async function truncateTarget() {
  const existing = await existingTables(target);
  const present = tables.filter((table) => existing.has(table));
  if (present.length === 0) return;
  await target.query(`truncate table ${present.map(quoteIdent).join(", ")} restart identity cascade`);
}

async function backup() {
  const existing = await existingTables(source);
  const data = {};
  for (const table of tables) {
    if (!existing.has(table)) {
      data[table] = [];
      continue;
    }
    data[table] = await source.query(`select * from ${quoteIdent(table)} order by 1`);
    console.log(`backed up ${table}: ${data[table].length}`);
  }
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(
    backupPath,
    JSON.stringify({ createdAt: new Date().toISOString(), tables: data }, null, 2)
  );
  return data;
}

async function insertRows(table, rows, options = {}) {
  if (rows.length === 0) return;
  const columns = await tableColumns(target, table);
  const insertColumns = columns.filter((column) => Object.hasOwn(rows[0], column.column_name));
  const values = rows
    .map((row) => {
      const patched = { ...row };
      for (const column of options.nullColumns ?? []) {
        if (Object.hasOwn(patched, column)) patched[column] = null;
      }
      return `(${insertColumns.map((column) => literal(patched[column.column_name], column)).join(",")})`;
    })
    .join(",");

  await target.query(
    `insert into ${quoteIdent(table)} (${insertColumns.map((column) => quoteIdent(column.column_name)).join(",")}) values ${values}`
  );
  console.log(`restored ${table}: ${rows.length}`);
}

async function restore(data) {
  await truncateTarget();

  for (const table of tables) {
    const nullColumns = nullableReferences
      .filter(([tableName]) => tableName === table)
      .map(([, column]) => column);
    await insertRows(table, data[table] ?? [], { nullColumns });
  }

  for (const [table, column] of nullableReferences) {
    const rows = (data[table] ?? []).filter((row) => row[column] !== null && row[column] !== undefined);
    for (const row of rows) {
      await target.query(
        `update ${quoteIdent(table)} set ${quoteIdent(column)} = ${literal(row[column])} where id = ${literal(row.id)}`
      );
    }
  }

  const sequences = await target`
    select sequence_name
    from information_schema.sequences
    where sequence_schema = 'public'
  `;
  for (const { sequence_name: sequenceName } of sequences) {
    const table = sequenceName.replace(/_id_seq$/, "");
    if (!tables.includes(table)) continue;
    await target.query(
      `select setval('${sequenceName.replaceAll("'", "''")}', coalesce((select max(id) from ${quoteIdent(
        table
      )}), 1), (select count(*) > 0 from ${quoteIdent(table)}))`
    );
  }
}

const data = await backup();
await restore(data);
console.log(`backup file: ${backupPath}`);
