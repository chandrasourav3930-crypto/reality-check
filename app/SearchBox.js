"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ defaultValue }) {
  const [value, setValue] = useState(defaultValue || "");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by target, vendor, or cell line — e.g. Ki-67, Abcam, MCF-7"
        className="flex-1 rounded-card border border-line bg-panel px-4 py-2.5 text-sm placeholder:text-ink/40 focus:border-accent"
      />
      <button
        type="submit"
        className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
      >
        Search
      </button>
    </form>
  );
}
