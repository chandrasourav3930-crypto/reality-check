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
  const category = searchParams?.category || "";
  const researchArea = searchParams?.research_area || "";
  const hasSearch = Boolean(q || technique || category || researchArea);

  let entries = null;
  let profilesById = {};
  let researchAreas = [];
  let anyReportsExist = false;
  let error = null;

  try {
    const supabase = createClient();

    const { data: areaRows } = await supabase
      .from("entries")
      .select("research_area")
      .not("research_area", "is", null);
    researchAreas = [...new Set((areaRows || []).map((r) => r.research_area))]
      .filter(Boolean)
      .sort();

    if (!hasSearch) {
      const { count } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true });
      anyReportsExist = (count || 0) > 0;
    }

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
      if (category) query = query.eq("category", category);
      if (researchArea) query = query.eq("research_area", researchArea);

      const result = await query;
      entries = result.data;
      error = result.error;

      if (entries?.length) {
        const userIds = [
          ...new Set(entries.map((e) => e.user_id).filter(Boolean)),
        ];
        if (userIds.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, is_academic, orcid_id")
            .in("id", userIds);
          profilesById = Object.fromEntries(
            (profiles || []).map((p) => [p.id, p])
          );
        }
      }
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
          Did this reagent actually work?
        </h1>
        <p className="mt-3 text-ink/60 max-w-xl">
          Real pass/fail reports from researchers — antibodies, primers,
          kits, and more — by marker, vendor, and model system, the details
          vendor pages never tell you.
        </p>
        <div className="mt-7">
          <FilterBar
            defaultQ={q}
            defaultTechnique={technique}
            defaultCategory={category}
            researchAreas={researchAreas}
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
          {!anyReportsExist && (
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
              <EntryCard
                entry={entry}
                counts={counts[groupKey(entry)]}
                author={profilesById[entry.user_id]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
