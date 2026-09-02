import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import EntryCard from "../../EntryCard";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, is_academic")
    .eq("id", params.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Author not found
        </h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
          {profile.display_name}
        </h1>
        {profile.is_academic && (
          <span
            title="Institutional email verified"
            className="text-works text-lg"
          >
            ✓
          </span>
        )}
      </div>
      <p className="text-ink/60 text-sm mb-8">
        {entries?.length || 0} report{entries?.length === 1 ? "" : "s"}{" "}
        submitted
      </p>

      {entries?.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-card border border-line bg-panel px-6 py-12 text-center text-ink/50">
          No reports yet.
        </div>
      )}
    </div>
  );
}
