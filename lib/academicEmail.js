// Lightweight heuristic for "this looks like an academic/institutional
// email" — not perfect, but catches the vast majority of real university
// and research-institute addresses without needing an external service.
const ACADEMIC_PATTERN =
  /\.(edu|ac\.[a-z]{2,3}|edu\.[a-z]{2,3}|res\.in|ac)$/i;

export function isAcademicEmail(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;
  return ACADEMIC_PATTERN.test(domain);
}
