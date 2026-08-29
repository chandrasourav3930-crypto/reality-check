"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function NavAuth() {
  const [email, setEmail] = useState(undefined); // undefined = loading

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user?.email ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (email === undefined) {
    return <span className="w-16" />; // avoid layout jump while loading
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-ink text-paper px-4 py-1.5 text-sm hover:bg-ink/90"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-ink/50 text-xs font-mono">
        {email}
      </span>
      <button
        onClick={handleSignOut}
        className="text-ink/70 hover:text-ink text-sm"
      >
        Sign out
      </button>
    </div>
  );
}
