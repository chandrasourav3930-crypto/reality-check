"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { CATEGORIES, RESEARCH_AREA_SUGGESTIONS, TECHNIQUES } from "@/lib/constants";

const emptyForm = {
  target: "",
  category: CATEGORIES[0],
  vendor: "",
  catalog_number: "",
  clone: "",
  cell_line: "",
  research_area: "",
  technique: TECHNIQUES[0],
  dilution: "",
  worked: "true",
  notes: "",
  doi_url: "",
};

export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitPageContent />
    </Suspense>
  );
}

function SubmitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [user, setUser] = useState(undefined); // undefined = loading
  const [needsProfile, setNeedsProfile] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle"); // idle | loading | saving | deleting | error | forbidden
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);

      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (!profile?.display_name) {
          setNeedsProfile(true);
          return;
        }
      }

      if (editId && userData.user) {
        setStatus("loading");
        const { data: entry, error } = await supabase
          .from("entries")
          .select("*")
          .eq("id", editId)
          .single();

        if (error || !entry) {
          setStatus("error");
          setErrorMessage("Couldn't find that report.");
          return;
        }
        if (entry.user_id !== userData.user.id) {
          setStatus("forbidden");
          return;
        }

        setForm({
          target: entry.target || "",
          category: entry.category || CATEGORIES[0],
          vendor: entry.vendor || "",
          catalog_number: entry.catalog_number || "",
          clone: entry.clone || "",
          cell_line: entry.cell_line || "",
          research_area: entry.research_area || "",
          technique: entry.technique || TECHNIQUES[0],
          dilution: entry.dilution || "",
          worked: String(entry.worked),
          notes: entry.notes || "",
          doi_url: entry.doi_url || "",
        });
        setStatus("idle");
      }
    }

    init();
  }, [editId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const supabase = createClient();
    const payload = {
      target: form.target.trim(),
      category: form.category,
      vendor: form.vendor.trim(),
      catalog_number: form.catalog_number.trim() || null,
      clone: form.clone.trim() || null,
      cell_line: form.cell_line.trim(),
      research_area: form.research_area.trim() || null,
      technique: form.technique,
      dilution: form.dilution.trim() || null,
      worked: form.worked === "true",
      notes: form.notes.trim() || null,
      doi_url: form.doi_url.trim() || null,
    };

    const { error } = editId
      ? await supabase.from("entries").update(payload).eq("id", editId)
      : await supabase.from("entries").insert({ ...payload, user_id: user.id });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this report? This can't be undone.")) return;
    setStatus("deleting");
    const supabase = createClient();
    const { error } = await supabase.from("entries").delete().eq("id", editId);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (user === undefined || status === "loading") {
    return null; // brief loading state
  }

  if (user === null) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Sign in to report a result
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          We ask for email verification so reports come from real
          researchers, not spam.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Set your public name first
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Every report shows who submitted it — takes 10 seconds to set
          up, then you'll be brought right back here.
        </p>
        <Link
          href={`/account?next=/submit${editId ? `?edit=${editId}` : ""}`}
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Set your name
        </Link>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="max-w-md mx-auto py-8 text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          Not your report
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          You can only edit reports you submitted yourself.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <h1 className="font-display font-bold text-2xl text-ink">
        {editId ? "Edit report" : "Report a result"}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {editId
          ? "Update the details below."
          : "Takes about a minute. Every field except notes is required."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Marker / target" required>
          <input
            required
            value={form.target}
            onChange={(e) => update("target", e.target.value)}
            placeholder="e.g. Ki-67, GAPDH, hsa-miR-21, EGFR exon 19"
            className="input"
          />
        </Field>

        <Field label="Category" required>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Vendor" required>
            <input
              required
              value={form.vendor}
              onChange={(e) => update("vendor", e.target.value)}
              placeholder="e.g. Abcam"
              className="input"
            />
          </Field>
          <Field label="Catalog number">
            <input
              value={form.catalog_number}
              onChange={(e) => update("catalog_number", e.target.value)}
              placeholder="e.g. ab16667"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Clone (if known)">
            <input
              value={form.clone}
              onChange={(e) => update("clone", e.target.value)}
              placeholder="e.g. MIB-1"
              className="input"
            />
          </Field>
          <Field label="Dilution used">
            <input
              value={form.dilution}
              onChange={(e) => update("dilution", e.target.value)}
              placeholder="e.g. 1:200"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Model system" required>
            <input
              required
              value={form.cell_line}
              onChange={(e) => update("cell_line", e.target.value)}
              placeholder="e.g. MCF-7, HEK293, mouse C57BL/6"
              className="input"
            />
          </Field>
          <Field label="Research area (optional)">
            <input
              list="research-area-suggestions"
              value={form.research_area}
              onChange={(e) => update("research_area", e.target.value)}
              placeholder="e.g. Breast cancer, Immunology, Neuroscience"
              className="input"
            />
            <datalist id="research-area-suggestions">
              {RESEARCH_AREA_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Technique" required>
          <select
            value={form.technique}
            onChange={(e) => update("technique", e.target.value)}
            className="input"
          >
            {TECHNIQUES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Did it work?" required>
          <div className="flex gap-3">
            <RadioPill
              label="Worked"
              checked={form.worked === "true"}
              onClick={() => update("worked", "true")}
              tone="works"
            />
            <RadioPill
              label="Did not work"
              checked={form.worked === "false"}
              onClick={() => update("worked", "false")}
              tone="fails"
            />
          </div>
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Anything the next person should know — background, fixation method, what you changed..."
            rows={3}
            className="input resize-none"
          />
        </Field>

        <Field label="Publication link (optional)">
          <input
            type="url"
            value={form.doi_url}
            onChange={(e) => update("doi_url", e.target.value)}
            placeholder="e.g. https://doi.org/10.xxxx/xxxxx"
            className="input"
          />
          <span className="text-xs text-ink/40 -mt-1">
            If this result appears in a published paper, linking it adds a
            "Published reference" badge to your report.
          </span>
        </Field>

        {status === "error" && (
          <p className="text-fails text-sm">{errorMessage}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === "saving" || status === "deleting"}
            className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
          >
            {status === "saving"
              ? "Saving…"
              : editId
              ? "Save changes"
              : "Submit report"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={status === "saving" || status === "deleting"}
              className="text-fails text-sm font-medium hover:text-fails/80 disabled:opacity-50"
            >
              {status === "deleting" ? "Deleting…" : "Delete this report"}
            </button>
          )}
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid #d9ded7;
          background: #ffffff;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
        }
        .input:focus {
          border-color: #2f6f5e;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-ink/70">
        {label}
        {required && <span className="text-fails"> *</span>}
      </span>
      {children}
    </label>
  );
}

function RadioPill({ label, checked, onClick, tone }) {
  const toneClasses =
    tone === "works"
      ? checked
        ? "bg-worksSoft border-works text-works"
        : "border-line text-ink/60"
      : checked
      ? "bg-failsSoft border-fails text-fails"
      : "border-line text-ink/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium ${toneClasses}`}
    >
      {label}
    </button>
  );
}
