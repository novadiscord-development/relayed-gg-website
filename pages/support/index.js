import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function SupportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_30%),radial-gradient(circle_at_bottom_right,#312e8155,transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mx-auto mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">
              Support Center
            </p>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              How can we{" "}
              <span className="bg-gradient-to-r from-violet-300 to-[#5865f2] bg-clip-text text-transparent">
                help?
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Get help with your account, desktop app, servers, billing, safety,
              or anything else related to Relayed.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <SupportCard
              title="Account Help"
              text="Login problems, account access, profile settings, and security."
              href="/support/account"
            />
            <SupportCard
              title="Desktop App"
              text="Installer issues, updates, startup settings, and Windows support."
              href="/support/desktop"
            />
            <SupportCard
              title="Servers & Communities"
              text="Help with servers, channels, roles, moderation, and members."
              href="/support/community"
            />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Contact support</h2>
              <p className="mt-3 leading-7 text-slate-400">
                Need direct help? Send us a message and we’ll get back to you as
                soon as possible.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-slate-400">Email</p>
                  <p className="mt-1 font-black">support@relayed.gg</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-bold text-slate-400">Response time</p>
                  <p className="mt-1 font-black">Usually within 24–48 hours</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Frequently asked questions</h2>

              <div className="mt-6 space-y-4">
                <FAQ
                  q="Why does Windows say Unknown Publisher?"
                  a="Relayed is a new desktop build. Until the app is code-signed with a trusted certificate, Windows may show an Unknown Publisher warning."
                />
                <FAQ
                  q="Does the desktop app update automatically?"
                  a="Website features update automatically through relayed.gg. Desktop-specific updates require the auto-updater release system."
                />
                <FAQ
                  q="Where can I download the Windows app?"
                  a="You can download the latest Windows installer from the Download page."
                />
                <FAQ
                  q="Can I suggest a feature?"
                  a="Yes. Feature ideas and bug reports can be sent to support@relayed.gg."
                />
              </div>
            </div>
          </div>

          <section className="mt-14 rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-950/80 via-[#080b18] to-black p-8 shadow-[0_0_80px_rgba(124,58,237,0.18)] md:p-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-4xl font-black">Need the desktop app?</h2>
                <p className="mt-4 max-w-2xl leading-8 text-slate-400">
                  Download Relayed for Windows and get a cleaner desktop
                  experience for your communities.
                </p>
              </div>

              <Link
                href="/download"
                className="rounded-xl bg-[#5865f2] px-6 py-3 text-center font-black hover:bg-[#4752c4]"
              >
                Download Relayed
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SupportCard({ title, text, href }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#5865f2]/40 hover:bg-white/[0.06]"
    >
      <div className="mb-5 h-12 w-12 rounded-2xl bg-[#5865f2]/10 shadow-[0_0_30px_rgba(88,101,242,0.25)]" />
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </Link>
  );
}

function FAQ({ q, a }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="font-black">{q}</h3>
      <p className="mt-2 leading-7 text-slate-400">{a}</p>
    </div>
  );
}