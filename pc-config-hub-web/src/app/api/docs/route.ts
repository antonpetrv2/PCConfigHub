const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PCConfigHub API</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; background: #0c0b14; color: #f2f3ff; }
    h1, h2 { color: #30f2ff; }
    code { background: #15142a; padding: 2px 6px; border-radius: 4px; }
    section { margin-bottom: 24px; }
    .note { color: #ffd166; }
  </style>
</head>
<body>
  <h1>PCConfigHub REST API</h1>
  <p>All responses return <code>{ data, error, meta }</code>. Protected routes require <code>Authorization: Bearer &lt;token&gt;</code>.</p>

  <section>
    <h2>Auth</h2>
    <ul>
      <li><code>POST /api/auth/register</code> - body: { name, email, password }</li>
      <li><code>POST /api/auth/login</code> - body: { email, password }</li>
      <li><code>GET /api/auth/me</code> - auth required</li>
    </ul>
  </section>

  <section>
    <h2>Parts</h2>
    <ul>
      <li><code>GET /api/parts</code> - query: category, search, page, limit</li>
      <li><code>GET /api/parts/[id]</code></li>
      <li><code>POST /api/parts</code> - multipart: payload JSON + image file</li>
      <li><code>PUT /api/parts/[id]</code></li>
      <li><code>DELETE /api/parts/[id]</code></li>
    </ul>
  </section>

  <section>
    <h2>Uploads</h2>
    <ul>
      <li><code>POST /api/upload</code> - multipart: file</li>
    </ul>
  </section>

  <section>
    <h2>Configurations</h2>
    <ul>
      <li><code>GET /api/configs</code> - query: page, limit</li>
      <li><code>GET /api/configs/[id]</code></li>
      <li><code>POST /api/configs</code> - body: { name, description?, visibility, parts[] }</li>
      <li><code>PUT /api/configs/[id]</code> - body: { name, description?, visibility, parts[] }</li>
      <li><code>DELETE /api/configs/[id]</code></li>
      <li><code>POST /api/configs/[id]/check-compatibility</code> - body: { parts[] }</li>
    </ul>
  </section>

  <section>
    <h2>Comments</h2>
    <ul>
      <li><code>GET /api/parts/[id]/comments</code></li>
      <li><code>POST /api/parts/[id]/comments</code> - body: { body }</li>
      <li><code>GET /api/configs/[id]/comments</code></li>
      <li><code>POST /api/configs/[id]/comments</code> - body: { body }</li>
    </ul>
  </section>

  <section>
    <h2>Admin</h2>
    <ul>
      <li><code>GET /api/admin/pending</code></li>
      <li><code>POST /api/admin/parts/[id]/approve</code></li>
      <li><code>POST /api/admin/parts/[id]/reject</code></li>
      <li><code>POST /api/admin/configs/[id]/approve</code></li>
      <li><code>POST /api/admin/configs/[id]/reject</code></li>
      <li><code>POST /api/admin/comments/[id]/approve</code></li>
      <li><code>POST /api/admin/comments/[id]/reject</code></li>
      <li><code>GET /api/admin/users</code></li>
      <li><code>PUT /api/admin/users/[id]/role</code> - body: { role }</li>
    </ul>
  </section>

  <p class="note">Image uploads are stored in R2. The payload field is JSON.</p>
</body>
</html>`;

export async function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
