import { createClient } from "@base44/sdk";

// Deliberately no api_key header here: that header authenticates every request as the
// app owner (verified — it made `auth.me()` resolve to the owner account with zero
// login). Anonymous reads of public entities (Hunt, Clue) work fine on just `appId`,
// and everything else goes through per-user login, which is safe to ship client-side.
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID as string,
});
