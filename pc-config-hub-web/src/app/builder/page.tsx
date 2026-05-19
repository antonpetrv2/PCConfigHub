import { getCurrentUser } from "@/lib/auth";
import { listCatalogComponents } from "@/services/component-service";
import Configurator from "@/app/builder/configurator";

export default async function BuilderPage() {
  const user = await getCurrentUser();
  const components = await listCatalogComponents(user?.id);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-8 h-64 w-64 rounded-full bg-[#30f2ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-32 h-56 w-56 rounded-full bg-[#ff5bf1]/15 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
            Configuration lab
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[#f2f3ff]">
            Build a new configuration
          </h1>
          <p className="max-w-2xl text-sm text-[#b3b7d4]">
            {user
              ? "Mix public and private components, then validate compatibility before saving."
              : "Select from public components to explore compatibility. Sign in to include your private parts."}
          </p>
        </header>

        <Configurator components={components} />
      </div>
    </section>
  );
}
