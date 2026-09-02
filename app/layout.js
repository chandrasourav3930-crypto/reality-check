import "./globals.css";
import Link from "next/link";
import NavAuth from "./NavAuth";

export const metadata = {
  title: "Find My Marker — reagent & marker reports from real labs",
  description:
    "A public log of what actually worked (and didn't) — antibodies, primers, kits, and other research reagents, reported by the researchers who used them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen flex flex-col">
        <header className="border-b border-line bg-paper sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-ink">
                Find My Marker
              </span>
              <span className="hidden sm:inline text-xs text-ink/50 font-mono">
                lab-tested, not vendor-tested
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-ink/70 hover:text-ink">
                Search
              </Link>
              <Link
                href="/submit"
                className="text-ink/70 hover:text-ink"
              >
                Report a result
              </Link>
              <NavAuth />
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">
          {children}
        </main>

        <footer className="border-t border-line mt-16">
          <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-ink/50 font-mono">
              Find My Marker is a community log, not a validation service.
              Always confirm reagent performance in your own hands.
            </p>
            <div className="flex gap-4 text-xs text-ink/60">
              <Link href="/about" className="hover:text-ink">
                About
              </Link>
              <Link href="/contact" className="hover:text-ink">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
