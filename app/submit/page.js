"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

const TECHNIQUES = [
  "Western blot",
  "IHC",
  "IF",
  "Flow cytometry",
  "IP",
  "ELISA",
  "Other",
];

const emptyForm = {
  target: "",
  vendor: "",
  catalog_number: "",
  clone: "",
  cell_line: "",
  cancer_type: "",
  technique: TECHNIQUES[0],
  dilution: "",
  worked: "true",
  notes: "",
};

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("entries").insert({
      target: form.target.trim(),
      vendor: form.vendor.trim(),
      catalog_number: form.catalog_number.trim() || null,
      clone: form.clone.trim() || null,
      cell_line: form.cell_line.trim(),
      cancer_type: form.cancer_type.trim() || null,
      technique: form.technique,
      dilution: form.dilution.trim() || null,
      worked: form.worked === "true",
      notes: form.notes.trim() || null,
      user_id: user.id,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (user === undefined) {
    return null; // brief loading state, avoids a flash of the wrong screen
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

  return (
    <div className="max-w-xl mx-auto py-4">
      <h1 className="font-display font-bold text-2xl text-ink">
        Report a result
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Takes about a minute. Every field except notes is required.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Target (protein/marker)" required>
          <input
            required
            value={form.target}
            onChange={(e) => update("target", e.target.value)}
            placeholder="e.g. Ki-67"
            className="input"
          />
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
          <Field label="Cell line" required>
            <input
              required
              value={form.cell_line}
              onChange={(e) => update("cell_line", e.target.value)}
              placeholder="e.g. MCF-7"
              className="input"
            />
          </Field>
          <Field label="Cancer type">
            <input
              value={form.cancer_type}
              onChange={(e) => update("cancer_type", e.target.value)}
              placeholder="e.g. Breast cancer"
              className="input"
            />
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

        {status === "error" && (
          <p className="text-fails text-sm">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-card bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-ink/90 disabled:opacity-50 self-start"
        >
          {status === "saving" ? "Saving…" : "Submit report"}
        </button>
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
