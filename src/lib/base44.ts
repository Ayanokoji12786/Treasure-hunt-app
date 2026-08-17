import { createClient } from "@base44/sdk";

// Deliberately no api_key header here: that header authenticates every request as the
// app owner (verified — it made `auth.me()` resolve to the owner account with zero
// login). Anonymous reads of public entities (Hunt, Clue) work fine on just `appId`,
// and everything else goes through per-user login, which is safe to ship client-side.
//
// appBaseUrl is required for the OAuth (loginWithProvider) redirect: the SDK builds the
// provider login URL as `${appBaseUrl}/api/apps/auth/login?...`. Without it, appBaseUrl
// defaults to "" and that URL becomes relative (resolving against localhost, which has
// no such endpoint), so "Continue with Google" silently goes nowhere.
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID as string,
  appBaseUrl: "https://base44.app",
});

// loginWithProvider does a full-page redirect to base44.app, which validates the
// `from_url` domain server-side before handing off to Google. It only recognizes the
// app's own *.base44.app domain or a DNS-verified custom domain (Workspace -> Domains
// in the Base44 editor, which points DNS at Base44's own hosting). A separately hosted
// rebuild like this one — deployed to Vercel, never proxied through Base44 — can't
// satisfy either, so the redirect lands on a raw `{"message":"Domain is not valid"}`
// page instead of Google. Confirmed: the same redirect succeeds from localhost.
// Gate the button on it rather than sending users into that crash.
export function isGoogleAuthSupported(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".base44.app");
}
