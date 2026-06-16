import Navbar from "@/components/landing/Navbar";

export default function SupportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030511] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c3aed55,transparent_30%),radial-gradient(circle_at_bottom_right,#312e8155,transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto max-w-7xl px-6">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center py-20">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl md:p-12">
            <p className="mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200">
              Support
            </p>

            <h1 className="text-5xl font-black md:text-6xl">
              Need help?
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              If you require support, have a question, want to report a bug,
              or need help with your account, please contact us using the
              email below.
            </p>

            <div className="mt-10 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-violet-300">
                Support Email
              </p>

              <a
                href="mailto:support@relayed.gg"
                className="mt-3 block text-2xl font-black text-white hover:text-violet-300"
              >
                support@relayed.gg
              </a>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              We aim to respond to all enquiries as quickly as possible.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}