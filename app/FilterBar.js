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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by target, vendor, or cell line — e.g. Ki-67, Abcam, MCF-7"
          className="flex-1 rounded-card border border-line bg-panel px-5 py-3.5 text-base placeholder:text-ink/40 focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-card bg-ink text-paper px-8 py-3.5 text-base font-medium hover:bg-ink/90 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-3">
        <select
          value={technique}
          onChange={(e) => {
            setTechnique(e.target.value);
            apply({ technique: e.target.value });
          }}
          className="flex-1 rounded-card border border-line bg-panel px-4 py-3 text-sm text-ink/70"
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
            className="flex-1 rounded-card border border-line bg-panel px-4 py-3 text-sm text-ink/70"
          >
            <option value="">All cancer types</option>
            {cancerTypes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
    </form>
  );
}
