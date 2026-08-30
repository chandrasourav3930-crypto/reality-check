"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import EntryCard from "./EntryCard";

function groupKey(entry) {
  return [entry.target, entry.vendor, entry.cell_line]
    .map((v) => (v || "").trim().toLowerCase())
    .join("|");
}

export default function EntryList({ entries }) {
  const [userId, setUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Count how many reports share the same target + vendor + cell line,
  // so we can show "N labs confirmed" on each card.
  const counts = {};
  for (const entry of entries) {
    const key = groupKey(entry);
    if (!counts[key]) counts[key] = { works: 0, fails: 0 };
    if (entry.worked) counts[key].works += 1;
    else counts[key].fails += 1;
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
    router.refresh();
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <EntryCard
            entry={entry}
            counts={counts[groupKey(entry)]}
            isOwner={userId && entry.user_id === userId}
            onDelete={() => handleDelete(entry.id)}
            deleting={deletingId === entry.id}
          />
        </li>
      ))}
    </ul>
  );
}
