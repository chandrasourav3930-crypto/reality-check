import { createClient } from "@/lib/supabaseServer";
import EntryList from "./EntryList";
import FilterBar from "./FilterBar";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const q = searchParams?.q?.trim() || "";
  const technique = searchParams?.technique || "";
  const cancerType = searchParams?.cancer_type || "";

  let entries = null;
  let cancerTypes = [];
  let error = null;

  try {
    const supabase = createClient();

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

    // Distinct cancer types, for the filter dropdown. Small table, so a
    // simple client-side unique over a light query is fine here.
    const { data: typesData } = await supabase
      .from("entries")
      .select("cancer_type")
      .not("cancer_type", "is", null);
    cancerTypes = [...new Set((typesData || []).map((r) => r.cancer_type))]
      .filter(Boolean)
      .sort();
  } catch (err) {
    error = err;
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
        <div className="mt-6">
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

      {!error && entries?.length === 0 && (
        <div className="rounded-card border border-line bg-panel px-6 py-12 text-center">
          <p className="text-ink font-medium">
            {q || technique || cancerType
              ? "No reports match those filters yet."
              : "No reports yet."}
          </p>
          <p className="text-ink/50 text-sm mt-1">
            Be the first to report a result.
          </p>
        </div>
      )}

      {!error && entries?.length > 0 && <EntryList entries={entries} />}
    </div>
  );
}
