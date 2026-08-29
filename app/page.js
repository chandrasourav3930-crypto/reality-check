import { createClient } from "@/lib/supabaseServer";
import EntryCard from "./EntryCard";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const q = searchParams?.q?.trim() || "";

  let entries = null;
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

    const result = await query;
    entries = result.data;
    error = result.error;
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
          <SearchBox defaultValue={q} />
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
            {q ? `No reports match "${q}" yet.` : "No reports yet."}
          </p>
          <p className="text-ink/50 text-sm mt-1">
            Be the first to report a result.
          </p>
        </div>
      )}

      {!error && entries?.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
