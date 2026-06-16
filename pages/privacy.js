import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#6d28d955,transparent_35%),radial-gradient(circle_at_bottom_right,#3b076455,transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <Navbar />

        <div className="py-12">
          <div className="mb-8 flex gap-3">
            <Link href="/terms" className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 hover:bg-white/[0.06]">
              Terms
            </Link>

            <Link href="/privacy" className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2">
              Privacy
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_80px_rgba(124,58,237,0.18)] backdrop-blur-2xl">
            <div className="rounded-2xl border border-white/10 bg-[#080b18]/80 p-8 md:p-12">
              <div className="max-w-4xl">
                <h1 className="text-5xl font-black">Privacy Policy</h1>

                <p className="mt-4 text-slate-400">
                  Last updated: January 2025
                </p>

                <div className="mt-10 space-y-10">
                  <section>
                    <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      We may collect account information, profile information,
                      messages, server content, and usage data.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">2. How We Use Information</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Information is used to operate, secure, improve, and
                      maintain the Relayed platform.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">3. Cookies & Analytics</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Relayed may use cookies, local storage, and analytics
                      technologies to improve user experience.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">4. Data Retention</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Data is retained only for as long as necessary to provide
                      the service and meet legal obligations.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">5. Security</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      We take reasonable measures to protect user information,
                      but cannot guarantee absolute security.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">6. Third-Party Services</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Relayed may use third-party providers for payments,
                      authentication, hosting, and analytics.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">7. Your Rights</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Users may request access, correction, export, or deletion
                      of personal data where applicable.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold">8. Contact</h2>
                    <p className="mt-4 text-slate-300 leading-8">
                      Questions regarding this Privacy Policy may be sent to
                      support@relayed.gg.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
