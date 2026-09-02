"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function NavAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", data.user.id)
          .maybeSingle();
        setDisplayName(profile?.display_name || "Account");
      }
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (user === undefined) {
    return <span className="w-16" />; // avoid layout jump while loading
  }

  if (!user) {
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
    <details className="relative">
      <summary className="list-none flex items-center gap-2 cursor-pointer select-none rounded-full border border-line pl-2 pr-3 py-1 hover:bg-worksSoft/30">
        <span className="w-6 h-6 rounded-full bg-ink text-paper text-xs flex items-center justify-center font-medium">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm text-ink/80 max-w-[10rem] truncate">
          {displayName}
        </span>
      </summary>

      <div className="absolute right-0 mt-2 w-44 rounded-card border border-line bg-panel shadow-lg overflow-hidden z-20">
        <Link
          href="/my-reports"
          className="block px-4 py-2.5 text-sm text-ink/80 hover:bg-worksSoft/40"
        >
          My reports
        </Link>
        <Link
          href="/account"
          className="block px-4 py-2.5 text-sm text-ink/80 hover:bg-worksSoft/40"
        >
          Account
        </Link>
        <button
          onClick={handleSignOut}
          className="block w-full text-left px-4 py-2.5 text-sm text-fails hover:bg-failsSoft/40"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
