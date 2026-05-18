import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-8 h-72 w-72 rounded-full bg-[#30f2ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-20 h-64 w-64 rounded-full bg-[#ff5bf1]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-1/3 h-44 w-44 rounded-full bg-[#ffd166]/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-4 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[#b3b7d4]">
              Retro-futurist hardware lab
            </p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-[#f2f3ff] sm:text-5xl lg:text-6xl">
              Prototype your next build in a neon-lit command bay.
            </h1>
            <p className="max-w-xl text-lg text-[#b3b7d4]">
              Scan parts, validate compatibility, and publish configurations
              once your rig is lab-certified.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="animate-pulse-glow rounded-full bg-[#30f2ff] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-[#ff5bf1]/60 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5bf1] hover:bg-[#ff5bf1]/10"
              >
                Register
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-[#0f0e1b]/90 p-6 shadow-[0_0_40px_rgba(48,242,255,0.15)] backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#f2f3ff]">
                  Active build
                </span>
                <span className="rounded-full bg-[#30f2ff]/20 px-3 py-1 text-xs font-semibold text-[#30f2ff]">
                  Certified
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "Atlas Z790 motherboard",
                  "Nova RTX 4080",
                  "Volt 750W PSU",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#14132a] px-4 py-3 text-sm text-[#f2f3ff]"
                  >
                    <span>{item}</span>
                    <span className="text-xs text-[#b3b7d4]">Ready</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-[#ffd166]/40 bg-[#1d1b33] px-4 py-3 text-sm text-[#ffd166]">
                Power draw: 520W
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Signal-rich catalog",
              detail: "Filter every component with lab-grade clarity.",
            },
            {
              title: "Compatibility matrix",
              detail: "Sockets and slots validated in real time.",
            },
            {
              title: "Publish on approval",
              detail: "Keep builds private or go public with review.",
            },
          ].map((card, index) => (
            <div
              key={card.title}
              className={`rounded-2xl border border-white/10 bg-[#121126]/90 p-5 shadow-[0_0_24px_rgba(255,91,241,0.12)] ${
                index === 0
                  ? "animate-fade-up"
                  : index === 1
                    ? "animate-fade-up-delay"
                    : "animate-fade-up-delay-2"
              }`}
            >
              <h3 className="font-[var(--font-display)] text-xl text-[#f2f3ff]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-[#b3b7d4]">{card.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
