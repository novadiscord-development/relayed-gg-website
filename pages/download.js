import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#6d28d955,transparent_35%),radial-gradient(circle_at_bottom_right,#3b076455,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <Navbar />

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200">
              Windows Desktop App
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Download
              <br />
              Relayed for
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">
                Windows.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Install the Relayed desktop app for faster access, a native window,
              and a cleaner community experience right from your PC.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://github.com/novadiscord-development/relayed-gg-website/releases/download/app/Relayed.Setup.0.1.0.exe"
                download
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-bold shadow-[0_0_25px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500"
              >
                Download for Windows
              </a>

              <Link
                href="/"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-bold hover:bg-white/[0.06]"
              >
                Back Home
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Windows 10/11 • 64-bit • Version 0.1.0
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#080b18]/80 p-6">
              <div className="rounded-2xl border border-white/10 bg-[#070a15] p-8">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_50px_rgba(124,58,237,0.25)]">
                  <Image
                    src="/logo.png"
                    alt="Relayed logo"
                    width={76}
                    height={76}
                    className="rounded-2xl"
                  />
                </div>

                <div className="mt-8 text-center">
                  <h2 className="text-3xl font-black">Relayed Desktop</h2>
                  <p className="mt-3 text-slate-400">
                    A focused desktop experience for your communities.
                  </p>
                </div>

                <div className="mt-8 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span className="text-slate-400">Platform</span>
                    <span className="font-bold">Windows</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span className="text-slate-400">Version</span>
                    <span className="font-bold">0.1.0</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span className="text-slate-400">Size</span>
                    <span className="font-bold">~78 MB</span>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
                  After downloading, open the installer and follow the setup
                  steps. Windows may ask you to confirm the app because it is a
                  new desktop build.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}