"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="font-display font-bold text-2xl text-ink">
        Reset your password
      </h1>

      {status === "sent" ? (
        <div className="mt-6 rounded-card border border-works/30 bg-worksSoft text-works px-4 py-3 text-sm">
          Check <strong>{email}</strong> for a link to set a new password.
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
            className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send reset link"}
          </button>
          {status === "error" && (
            <p className="text-fails text-sm">{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
