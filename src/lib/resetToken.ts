const TOKEN_KEYS = ["reset_token", "resettoken", "token", "reset-token", "code"];

function fromParams(params: URLSearchParams): string | null {
  for (const [key, value] of params.entries()) {
    if (TOKEN_KEYS.includes(key.toLowerCase()) && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Base44's reset email delivers the token inside a link. Players naturally paste the
 * whole URL, so accept either a raw token or any URL/text that contains one — pulling
 * the token out of the query string or hash fragment.
 */
export function extractResetToken(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (trimmed.includes("://") || trimmed.startsWith("?") || trimmed.startsWith("#")) {
    try {
      const url = new URL(trimmed, "https://placeholder.local");
      const fromQuery = fromParams(url.searchParams);
      if (fromQuery) return fromQuery;
      const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
      const fromHash = fromParams(new URLSearchParams(hash));
      if (fromHash) return fromHash;
    } catch {
      // fall through to returning the raw string
    }
  }

  return trimmed;
}

/** Reads a reset token straight out of the current page URL (query or hash), if present. */
export function tokenFromLocation(): string {
  if (typeof window === "undefined") return "";
  const fromQuery = fromParams(new URLSearchParams(window.location.search));
  if (fromQuery) return fromQuery;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return fromParams(new URLSearchParams(hash)) ?? "";
}
