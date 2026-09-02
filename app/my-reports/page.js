"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import EntryCard from "../EntryCard";

export default function MyReportsPage() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user ?? null);

    if (userData.user) {
      const [{ data }, { data: profileData }] = await Promise.all([
        supabase
          .from("entries")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, display_name, is_academic")
          .eq("id", userData.user.id)
          .maybeSingle(),
      ]);

      setEntries(data || []);
      setProfile(profileData || null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this report? This can't be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("entries").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      alert(`Couldn't delete: ${error.message}`);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (user === undefined) {
    return null; // brief loading state
  }

  if (user === null) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Sign in to see your reports
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
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
            Your reports
          </h1>
          <p className="text-ink/60 text-sm mt-1">
            Everything you've submitted — edit or delete anytime.
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-card bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90"
        >
          + New report
        </Link>
      </div>

      {error && (
        <div className="rounded-card border border-fails/30 bg-failsSoft text-fails px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {entries?.length === 0 && (
        <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
          <p className="text-ink font-medium">
            You haven't submitted any reports yet.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
          >
            Report your first result
          </Link>
        </div>
      )}

      {entries?.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard
                entry={entry}
                author={profile}
                isOwner
                onDelete={() => handleDelete(entry.id)}
                deleting={deletingId === entry.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
