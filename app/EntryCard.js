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

export default function EntryCard({ entry }) {
  const status = STATUS[String(entry.worked)];

  return (
    <article className="relative rounded-card border border-line bg-panel overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${status.bar}`} />
      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display font-semibold text-lg text-ink leading-snug">
            {entry.target}
          </h2>
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

        <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm font-mono text-ink/80">
          <dt className="text-ink/40">Cell line</dt>
          <dd>{entry.cell_line}</dd>

          <dt className="text-ink/40">Technique</dt>
          <dd>{entry.technique}</dd>

          {entry.dilution && (
            <>
              <dt className="text-ink/40">Dilution</dt>
              <dd>{entry.dilution}</dd>
            </>
          )}

          {entry.cancer_type && (
            <>
              <dt className="text-ink/40">Cancer type</dt>
              <dd>{entry.cancer_type}</dd>
            </>
          )}
        </dl>

        {entry.notes && (
          <p className="mt-3 text-sm text-ink/70 border-t border-line pt-3">
            {entry.notes}
          </p>
        )}
      </div>
    </article>
  );
}
