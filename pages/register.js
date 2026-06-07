import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(form),
});

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <AuthLayout title="Create your account" subtitle="It only takes a minute!">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <AuthInput
          label="Username"
          name="username"
          value={form.username}
          onChange={updateField}
          placeholder="Choose a username"
        />

        <AuthInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          placeholder="Enter your email"
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          placeholder="Create a password"
        />

        <AuthInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={updateField}
          placeholder="Confirm your password"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}