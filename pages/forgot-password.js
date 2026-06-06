import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      sideText="No worries. We'll help you get back in."
    >
      <form className="space-y-5">
        <AuthInput label="Email" type="email" placeholder="Enter your email" />

        <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] hover:from-violet-500 hover:to-purple-500">
          Send Reset Link
        </button>

        <Link
          href="/login"
          className="block rounded-xl border border-white/10 bg-white/[0.03] py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
        >
          ← Back to Sign In
        </Link>
      </form>
    </AuthLayout>
  );
}