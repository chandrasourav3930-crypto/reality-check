import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import EntryCard from "./EntryCard";
import FilterBar from "./FilterBar";

export const dynamic = "force-dynamic";

function groupKey(entry) {
  return [entry.target, entry.vendor, entry.cell_line]
    .map((v) => (v || "").trim().toLowerCase())
    .join("|");
}

export default async function HomePage({ searchParams }) {
  const q = searchParams?.q?.trim() || "";
  const technique = searchParams?.technique || "";
  const cancerType = searchParams?.cancer_type || "";
  const hasSearch = Boolean(q || technique || cancerType);

  let entries = null;
  let cancerTypes = [];
  let stats = null;
  let error = null;

  try {
    const supabase = createClient();

    // Distinct cancer types, for the filter dropdown.
    const { data: typesData } = await supabase
      .from("entries")
      .select("cancer_type")
      .not("cancer_type", "is", null);
    cancerTypes = [...new Set((typesData || []).map((r) => r.cancer_type))]
      .filter(Boolean)
      .sort();

    if (hasSearch) {
      let query = supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (q) {
        query = query.or(
          `target.ilike.%${q}%,vendor.ilike.%${q}%,cell_line.ilike.%${q}%,catalog_number.ilike.%${q}%`
        );
      }
      if (technique) query = query.eq("technique", technique);
      if (cancerType) query = query.eq("cancer_type", cancerType);

      const result = await query;
      entries = result.data;
      error = result.error;
    } else {
      // No search yet — just show light stats, not the full table.
      const { count } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true });
      const { data: targetsData } = await supabase
        .from("entries")
        .select("target");
      const targetCount = new Set(
        (targetsData || []).map((r) => r.target?.trim().toLowerCase())
      ).size;
      stats = { reports: count || 0, targets: targetCount };
    }
  } catch (err) {
    error = err;
  }

  const counts = {};
  if (entries) {
    for (const entry of entries) {
      const key = groupKey(entry);
      if (!counts[key]) counts[key] = { works: 0, fails: 0 };
      if (entry.worked) counts[key].works += 1;
      else counts[key].fails += 1;
    }
  }

  return (
    <div>
      <section className="mb-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight max-w-2xl">
          Did this antibody actually work?
        </h1>
        <p className="mt-3 text-ink/60 max-w-xl">
          Real pass/fail reports from researchers, by target, vendor, and cell
          line — the details vendor pages never tell you.
        </p>
        <div className="mt-7">
          <FilterBar
            defaultQ={q}
            defaultTechnique={technique}
            cancerTypes={cancerTypes}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-card border border-fails/30 bg-failsSoft text-fails px-4 py-3 text-sm mb-6">
          Couldn't load entries yet. If you haven't connected Supabase, see
          the README to finish setup.
        </div>
      )}

      {!error && !hasSearch && (
        <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
          <p className="text-ink font-medium">
            Search above to see reports.
          </p>
          {stats && stats.reports > 0 ? (
            <p className="text-ink/50 text-sm mt-1 font-mono">
              {stats.reports} report{stats.reports === 1 ? "" : "s"} across{" "}
              {stats.targets} target{stats.targets === 1 ? "" : "s"} so far.
            </p>
          ) : (
            <p className="text-ink/50 text-sm mt-1">
              No reports yet —{" "}
              <Link href="/submit" className="underline hover:text-ink">
                be the first
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {!error && hasSearch && entries?.length === 0 && (
        <div className="rounded-card border border-line bg-panel px-6 py-12 text-center">
          <p className="text-ink font-medium">
            No reports match those filters yet.
          </p>
          <p className="text-ink/50 text-sm mt-1">
            Be the first to report this one.
          </p>
        </div>
      )}

      {!error && hasSearch && entries?.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} counts={counts[groupKey(entry)]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
