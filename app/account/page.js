"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { isAcademicEmail } from "@/lib/academicEmail";

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/my-reports";

  const [user, setUser] = useState(undefined);
  const [displayName, setDisplayName] = useState("");
  const [isAcademic, setIsAcademic] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        setIsAcademic(isAcademicEmail(data.user.email));
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.display_name) setDisplayName(profile.display_name);
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName.trim(),
      is_academic: isAcademicEmail(user.email),
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (user === undefined) return null;

  if (user === null) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Sign in first
        </h1>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="font-display font-bold text-2xl text-ink">
        Your public name
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Shown on every report you submit — never your email. Use your real
        name, initials, or a lab name, whatever you're comfortable with.
      </p>

      {isAcademic && (
        <div className="mt-4 rounded-card bg-worksSoft text-works px-3 py-2 text-xs font-medium inline-block">
          ✓ Institutional email detected — your reports will show a
          Verified institution badge
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Sourav C., Chen Lab"
          className="rounded-card border border-line bg-panel px-4 py-2.5 text-sm focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "error" && (
          <p className="text-fails text-sm">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
