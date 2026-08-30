"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TECHNIQUES } from "@/lib/constants";

export default function FilterBar({ defaultQ, defaultTechnique, cancerTypes }) {
  const [q, setQ] = useState(defaultQ || "");
  const [technique, setTechnique] = useState(defaultTechnique || "");
  const [cancerType, setCancerType] = useState("");
  const router = useRouter();

  function apply(next) {
    const params = new URLSearchParams();
    const merged = { q, technique, cancerType, ...next };
    if (merged.q?.trim()) params.set("q", merged.q.trim());
    if (merged.technique) params.set("technique", merged.technique);
    if (merged.cancerType) params.set("cancer_type", merged.cancerType);
    router.push(`/?${params.toString()}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    apply({});
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 max-w-2xl">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by target, vendor, or cell line — e.g. Ki-67, Abcam, MCF-7"
        className="flex-1 min-w-[220px] rounded-card border border-line bg-panel px-4 py-2.5 text-sm placeholder:text-ink/40 focus:border-accent"
      />

      <select
        value={technique}
        onChange={(e) => {
          setTechnique(e.target.value);
          apply({ technique: e.target.value });
        }}
        className="rounded-card border border-line bg-panel px-3 py-2.5 text-sm text-ink/70"
      >
        <option value="">All techniques</option>
        {TECHNIQUES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {cancerTypes?.length > 0 && (
        <select
          value={cancerType}
          onChange={(e) => {
            setCancerType(e.target.value);
            apply({ cancerType: e.target.value });
          }}
          className="rounded-card border border-line bg-panel px-3 py-2.5 text-sm text-ink/70"
        >
          <option value="">All cancer types</option>
          {cancerTypes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <button
        type="submit"
        className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
      >
        Search
      </button>
    </form>
  );
}
