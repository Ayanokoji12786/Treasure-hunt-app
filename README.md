# Luma Hunt

Real-world treasure hunts powered by AI vision — create a hunt, pin clues on a map, and have players scan their surroundings to unlock the next step.

This is a from-scratch rebuild of a Base44 app called **LuminaHunt**, cloned by inspecting the live product (its GitHub export required a paid Base44 plan we didn't have), plus a set of enhancements layered on top. It's a fully self-contained React app — no backend to deploy, no accounts to create to run it.

## Features

Cloned from the original:

- Email/password auth (register, login, sign out)
- Explore public hunts, search + filter by difficulty
- Create a hunt: title, description, difficulty, cover image, and repeatable clues (location name, map pin, player-facing hint, an AI-verification description, optional reference photo)
- Join a hunt by 6-character code
- Hunt detail page with clue progress (locked → current → solved)
- Gameplay loop: read the hint, scan a photo, AI verifies it against the location, next clue unlocks
- My Hunts (in progress / completed), global leaderboard, profile with stats and badges

Added on top:

- **Real AI photo verification** via Groq's vision API instead of a placeholder — see [AI verification](#ai-photo-verification) below
- **GPS proximity check** — shows how far you are from the clue's coordinates before you scan (advisory, not a hard gate, so it's still testable from a desk)
- **Hint penalty & speed bonus scoring** — revealing the AI-verification description costs points; finishing fast earns a bonus
- **Confetti + completion screen** with score and elapsed time
- **Custom visual identity** — navy gradient background with a subtle starfield/contour-line texture, gold/explorer-green/sky-blue accent palette, glassmorphism cards, and Lucide icons throughout
- **QR code + shareable link** for a hunt's join code
- **Export / import a hunt as JSON** — the only way to move a hunt between browsers/devices since there's no shared backend (see [Architecture](#architecture--the-honest-caveat))
- **PWA manifest** (installable / "Add to Home Screen")

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL. Register an account (stored locally in your browser — see below), then Explore, Create, or Join a hunt.

### Enabling AI photo verification

Without any configuration, "Scan Surroundings" auto-accepts every photo and shows a visible "AI verification disabled" notice — the app is fully playable either way. To turn on real verification:

1. Copy `.env.example` to `.env`.
2. Set `VITE_GROQ_API_KEY` to a key from [console.groq.com/keys](https://console.groq.com/keys).
3. Restart `npm run dev`.

`VITE_GROQ_MODEL` optionally overrides the model (defaults to `qwen/qwen3.6-27b`, Groq's vision-capable model).

**Security note:** this calls Groq's API directly from the browser. That means your API key ships inside the client bundle and is visible to anyone who opens dev tools. That's fine for running this locally or sharing it with friends you trust; it is **not** safe for a publicly deployed multi-user app. For that, put a small backend/serverless function between the browser and Groq so the key never reaches the client.

## Architecture — the honest caveat

The original LuminaHunt has a real backend (Base44's hosted database + auth). This rebuild does not — it's a static frontend that persists everything (accounts, hunts, progress, leaderboard) to **`localStorage` in your browser**. That means:

- Accounts and hunts you create are local to whichever browser you created them in. Someone else opening the app in their own browser sees only the three seed hunts, not your custom ones.
- The "Share code" / QR code lets someone *join* a hunt code, but if the hunt doesn't exist in their browser's storage, the code won't resolve. Use **Export hunt as JSON** and send the file to actually share a custom hunt today.
- The leaderboard, "My Hunts," and profile stats are all per-browser, not global.

This is the tradeoff for having something that runs immediately with `npm install && npm run dev`, no cloud account, no cost. If you want the real multi-user behavior the original had, the natural next step is a small hosted backend (e.g. Supabase or Firebase, both have free tiers) — swapping `src/lib/storage.ts` and the two Zustand stores for API calls is the main integration point; the rest of the UI wouldn't need to change much.

## Tech stack

Vite + React + TypeScript + Tailwind CSS v4, React Router, Zustand for state, Leaflet + OpenStreetMap for the map picker (free, no API key), `qrcode.react`, `canvas-confetti`, `lucide-react` for icons.

## Suggested next features

Not built yet, but natural extensions:

- A real backend for genuinely shared/multiplayer hunts (see above)
- Team play / multiplayer races on the same hunt
- Push notifications when a friend joins your hunt
- Timed/limited hunts (e.g. only playable during an event window)
- Photo gallery of everyone's submitted verification photos per hunt
- Social login (Google OAuth) — the original had this; it needs a backend to do properly
