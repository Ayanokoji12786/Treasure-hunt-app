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
