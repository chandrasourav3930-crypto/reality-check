"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("Invalid login credentials")
          ? "Wrong email or password."
          : error.message
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="max-w-sm mx-auto py-10 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Check your email
        </h1>
        <p className="mt-3 text-sm text-ink/60">
          We sent a verification link to <strong>{email}</strong>. Click it
          to activate your account — you'll only need to do this once.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <div className="flex rounded-card border border-line overflow-hidden mb-8">
        <button
          onClick={() => {
            setMode("signin");
            setStatus("idle");
            setErrorMessage("");
          }}
          className={`flex-1 py-2.5 text-sm font-medium ${
            mode === "signin"
              ? "bg-ink text-paper"
              : "bg-panel text-ink/60 hover:text-ink"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setStatus("idle");
            setErrorMessage("");
          }}
          className={`flex-1 py-2.5 text-sm font-medium ${
            mode === "signup"
              ? "bg-ink text-paper"
              : "bg-panel text-ink/60 hover:text-ink"
          }`}
        >
          Create account
        </button>
      </div>

      <h1 className="font-display font-bold text-2xl text-ink">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      {mode === "signup" && (
        <p className="mt-2 text-sm text-ink/60">
          One-time email verification, then you're set — no need to verify
          again on future sign-ins.
        </p>
      )}

      <form
        onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
        className="mt-6 flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink/70">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink/70">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : ""}
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
        </label>

        {mode === "signup" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-ink/70">Confirm password</span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
            />
          </label>
        )}

        {mode === "signin" && (
          <Link
            href="/forgot-password"
            className="text-xs text-ink/50 hover:text-ink self-end -mt-1"
          >
            Forgot password?
          </Link>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          {status === "loading"
            ? "Please wait…"
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        {status === "error" && (
          <p className="text-fails text-sm">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
