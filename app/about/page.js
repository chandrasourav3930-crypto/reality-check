export const metadata = {
  title: "About — Reality Check",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl text-ink">
        About Reality Check
      </h1>

      <div className="mt-6 flex flex-col gap-4 text-ink/80 leading-relaxed">
        <p>
          Vendor pages tell you an antibody was validated. They don't tell
          you whether it actually worked in <em>your</em> cell line, at{" "}
          <em>your</em> dilution, for your specific technique. That gap is
          where a lot of wasted weeks in a lab come from.
        </p>
        <p>
          Reality Check is a public, crowd-sourced log of real results —
          worked or didn't — reported by the researchers who actually ran
          the experiment. No vendor marketing, no cherry-picked validation
          images. Just what happened on the bench.
        </p>
        <p>
          Anyone can search it for free. Submitting a report takes about a
          minute and requires a verified email, just to keep it a real
          researcher on the other end rather than spam.
        </p>
        <p className="text-ink/60 text-sm border-t border-line pt-4 mt-2">
          This is an independent, community-run project — not affiliated
          with any antibody vendor, journal, or institution. Always confirm
          reagent performance in your own hands before relying on it.
        </p>
      </div>
    </div>
  );
}
