import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import EntryCard from "./EntryCard";
import FilterBar from "./FilterBar";
import StatsCharts from "./StatsCharts";

export const dynamic = "force-dynamic";

function groupKey(entry) {
  return [entry.target, entry.vendor, entry.cell_line]
    .map((v) => (v || "").trim().toLowerCase())
    .join("|");
}

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
  let growth = [];
  let categoryBreakdown = [];
  let error = null;

  try {
    const supabase = createClient();

    // All rows, lightweight columns only — used to build filters + charts.
    const { data: allRows } = await supabase
      .from("entries")
      .select("created_at, vendor, category, research_area")
      .order("created_at", { ascending: true });

    if (allRows?.length) {
      researchAreas = [
        ...new Set(allRows.map((r) => r.research_area)),
      ]
        .filter(Boolean)
        .sort();

      // Cumulative reports + cumulative distinct vendors, by month.
      const seenVendors = new Set();
      const byMonth = new Map();
      for (const row of allRows) {
        const key = monthKey(row.created_at);
        seenVendors.add((row.vendor || "").trim().toLowerCase());
        byMonth.set(key, {
          reports: (byMonth.get(key)?.reports || 0) + 1,
          vendors: seenVendors.size,
        });
      }
      let cumulativeReports = 0;
      growth = [...byMonth.entries()]
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([month, v]) => {
          cumulativeReports += v.reports;
          return { month, reports: cumulativeReports, vendors: v.vendors };
        });

      const catCounts = {};
      for (const row of allRows) {
        const cat = row.category || "Antibody";
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      }
      categoryBreakdown = Object.entries(catCounts).map(([cat, count]) => ({
        category: cat,
        count,
      }));
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
            .select("id, display_name, is_academic")
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

      {!error && (
        <StatsCharts growth={growth} categoryBreakdown={categoryBreakdown} />
      )}

      {!error && !hasSearch && (
        <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
          <p className="text-ink font-medium">
            Search above to see reports.
          </p>
          {growth.length === 0 && (
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
