"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // becomes true once the
  // recovery link has been recognized and a session established
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // Supabase fires this specific event once it's parsed the recovery
    // link in the URL and set up a temporary session for the password
    // change. We wait for it rather than assuming it's already there.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      }
    );

    // In case the event already fired before this listener attached,
    // also check directly for an existing session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(() => {
      if (!ready) setLinkInvalid(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [ready]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/my-reports");
    router.refresh();
  }

  if (linkInvalid) {
    return (
      <div className="max-w-sm mx-auto py-10 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Link expired or invalid
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Password reset links only work once and expire after a while.
          Request a fresh one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-sm mx-auto py-10 text-center text-ink/50 text-sm">
        Verifying your link…
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="font-display font-bold text-2xl text-ink">
        Set a new password
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink/70">New password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink/70">Confirm new password</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Set password"}
        </button>
        {status === "error" && (
          <p className="text-fails text-sm">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
