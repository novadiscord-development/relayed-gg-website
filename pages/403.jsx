import Head from "next/head";
import { useRouter } from "next/router";
import { ShieldAlert, Home } from "lucide-react";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>403 | Relayed.gg</title>
      </Head>

      <main className="flex h-[100dvh] items-center justify-center bg-[#050712] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 text-red-300">
            <ShieldAlert size={38} />
          </div>

          <h1 className="text-4xl font-black">403</h1>
          <h2 className="mt-2 text-xl font-black">Access denied</h2>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            You do not have permission to view this page, server, or channel.
          </p>

          <button
            type="button"
            onClick={() => router.push("/app")}
            className="mx-auto mt-8 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-500"
          >
            <Home size={17} />
            Back to app
          </button>
        </div>
      </main>
    </>
  );
}
