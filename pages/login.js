import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      login: form.login,
      password: form.password,
    });

    if (res?.error) {
      setError("Invalid email, username or password");
      setLoading(false);
      return;
    }

    router.push("/app");
  }

  return (
    <AuthLayout title="Welcome back" subtitle="We're excited to see you again!">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <AuthInput
          label="Email or Username"
          name="login"
          value={form.login}
          onChange={updateField}
          placeholder="Enter your email or username"
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          placeholder="Enter your password"
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}