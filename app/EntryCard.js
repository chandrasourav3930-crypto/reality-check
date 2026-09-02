"use client";

import Link from "next/link";

const STATUS = {
  true: {
    label: "Worked",
    bar: "bg-works",
    chip: "bg-worksSoft text-works",
  },
  false: {
    label: "Did not work",
    bar: "bg-fails",
    chip: "bg-failsSoft text-fails",
  },
};

export default function EntryCard({
  entry,
  counts,
  author,
  isOwner,
  onDelete,
  deleting,
}) {
  const status = STATUS[String(entry.worked)];
  const totalReports = (counts?.works || 0) + (counts?.fails || 0);

  return (
    <article className="relative rounded-card border border-line bg-panel overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${status.bar}`} />
      <div className="pl-5 pr-4 py-4">
        {author?.display_name && (
          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <Link
              href={`/author/${author.id}`}
              className="text-ink/60 hover:text-ink font-medium"
            >
              {author.display_name}
            </Link>
            {author.is_academic && (
              <span
                title="Institutional email verified"
                className="inline-flex items-center gap-0.5 text-works"
              >
                ✓
              </span>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[10px] uppercase tracking-wide font-mono text-ink/40 mb-0.5">
              {entry.category || "Antibody"}
            </span>
            <h2 className="font-display font-semibold text-lg text-ink leading-snug">
              {entry.target}
            </h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.chip}`}
          >
            {status.label}
          </span>
        </div>

        <p className="text-sm text-ink/60 mt-0.5">
          {entry.vendor}
          {entry.catalog_number ? ` · ${entry.catalog_number}` : ""}
          {entry.clone ? ` · clone ${entry.clone}` : ""}
        </p>

        {totalReports > 1 && (
          <p className="mt-2 text-xs font-mono text-ink/50">
            {totalReports} labs reported this combo
            {counts.works > 0 && counts.fails > 0
              ? ` (${counts.works} worked, ${counts.fails} didn't)`
              : ""}
          </p>
        )}

        <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm font-mono text-ink/80">
          <dt className="text-ink/40">Model system</dt>
          <dd>{entry.cell_line}</dd>

          <dt className="text-ink/40">Technique</dt>
          <dd>{entry.technique}</dd>

          {entry.dilution && (
            <>
              <dt className="text-ink/40">Dilution</dt>
              <dd>{entry.dilution}</dd>
            </>
          )}

          {entry.research_area && (
            <>
              <dt className="text-ink/40">Research area</dt>
              <dd>{entry.research_area}</dd>
            </>
          )}
        </dl>

        {entry.notes && (
          <p className="mt-3 text-sm text-ink/70 border-t border-line pt-3">
            {entry.notes}
          </p>
        )}

        {entry.doi_url && (
          <a
            href={entry.doi_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-mixed hover:text-mixed/80"
          >
            Published reference ↗
          </a>
        )}

        {isOwner && (
          <div className="mt-3 border-t border-line pt-3 flex gap-4 text-xs">
            <Link
              href={`/submit?edit=${entry.id}`}
              className="text-ink/60 hover:text-ink font-medium"
            >
              Edit
            </Link>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="text-fails hover:text-fails/80 font-medium disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
