import Image from "next/image";

export default function AuthLayout({ title, subtitle, children, sideText }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#6d28d955,transparent_35%),radial-gradient(circle_at_bottom_left,#3b076455,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl md:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden border-r border-white/10 p-10 md:flex md:flex-col md:items-center md:justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#7c3aed30,transparent_45%)]" />

            <div className="relative text-center">
              <Image
                src="/logo.png"
                alt="relayed.gg logo"
                width={96}
                height={96}
                className="mx-auto rounded-full shadow-[0_0_40px_rgba(124,58,237,0.45)]"
              />

              <h2 className="mt-5 text-2xl font-black">
                relayed<span className="text-violet-400">.gg</span>
              </h2>

              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                {sideText || "Your community. Your rules. No limits."}
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#080b18]/70 p-7 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 text-center">
                <Image
                  src="/logo.png"
                  alt="relayed.gg logo"
                  width={86}
                  height={86}
                  className="mx-auto rounded-full shadow-[0_0_35px_rgba(124,58,237,0.45)]"
                />

                <h1 className="mt-5 text-2xl font-black">{title}</h1>
                <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}