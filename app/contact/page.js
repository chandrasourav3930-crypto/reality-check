export const metadata = {
  title: "Contact — Find My Marker",
};

// Change this to the email address you want to receive messages at.
const CONTACT_EMAIL = "your-email@example.com";

export default function ContactPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display font-bold text-3xl text-ink">Contact</h1>
      <p className="mt-4 text-ink/70 leading-relaxed">
        Found a bug, have a feature idea, or want to report something that
        looks wrong? Reach out directly:
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-6 inline-block rounded-card bg-ink text-paper px-6 py-3 text-sm font-medium hover:bg-ink/90"
      >
        Email {CONTACT_EMAIL}
      </a>

      <p className="mt-6 text-ink/50 text-sm">
        This opens your email app. If that doesn't work on your device, you
        can also just copy the address above.
      </p>
    </div>
  );
}
