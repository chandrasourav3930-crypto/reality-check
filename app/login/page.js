"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="font-display font-bold text-2xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-ink/60">
        No password needed. We'll email you a link — click it to verify
        you're a real person and you're in.
      </p>

      {status === "sent" ? (
        <div className="mt-6 rounded-card border border-works/30 bg-worksSoft text-works px-4 py-3 text-sm">
          Check <strong>{email}</strong> for a sign-in link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <label className="text-sm text-ink/70" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending link…" : "Send sign-in link"}
          </button>
          {status === "error" && (
            <p className="text-fails text-sm">{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
