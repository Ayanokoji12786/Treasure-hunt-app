# Luma Hunt

Real-world treasure hunts powered by AI vision — create a hunt, search locations for the map, and have players scan their surroundings to unlock the next step.

This is a from-scratch rebuild of a Base44 app called **LuminaHunt**, built by inspecting the live product and its real backend schema, plus a set of enhancements layered on top. Unlike a typical rebuild, this one talks to the **real, shared Base44 backend** behind the original app — hunts, clues, and progress are genuinely persisted server-side and visible across browsers, not faked in `localStorage`.

## Features

Cloned from the original:

- Email/password auth with real email verification (register → check your inbox for a code → verify → log in)
- Explore public hunts, search + filter by difficulty
- Create a hunt: title, description, difficulty, cover image, and repeatable clues (location name, location search, player-facing hint, an AI-verification description, optional reference photo)
- Join a hunt by 6-character code
- Hunt detail page with clue progress (locked → current → solved)
- Gameplay loop: read the hint, scan a photo, AI verifies it against the location, next clue unlocks
- My Hunts (in progress / completed), leaderboard, profile with stats and badges

Added on top:

- **Real AI photo verification** via Groq's vision API instead of a placeholder — see [AI verification](#enabling-ai-photo-verification) below
- **GPS proximity check** — geocodes each clue's location on the fly and shows how far you are from it before you scan (advisory, not a hard gate, so it's still testable from a desk)
- **Hint penalty & speed bonus scoring** — revealing the AI-verification description costs points; finishing fast earns a bonus
- **Confetti + completion screen** with score and elapsed time
- **Custom visual identity** — navy gradient background with a subtle starfield/contour-line texture, gold/explorer-green/sky-blue accent palette, glassmorphism cards, and Lucide icons throughout
- **QR code + shareable link** for a hunt's join code
- **Export / import a hunt as JSON** — a portable backup/sharing format, on top of the real backend
- **PWA manifest** (installable / "Add to Home Screen")

## Getting started

```bash
npm install
npm run dev
```

Open the printed localhost URL, register an account (real email verification required), then Explore, Create, or Join a hunt.

### Enabling AI photo verification

Without any configuration, "Find Treasure" auto-accepts every photo and shows a visible "AI verification disabled" notice — the app is fully playable either way. To turn on real verification:

1. Copy `.env.example` to `.env`.
2. Set `VITE_GROQ_API_KEY` to a key from [console.groq.com/keys](https://console.groq.com/keys).
3. Restart `npm run dev`.

`VITE_GROQ_MODEL` optionally overrides the model (defaults to `qwen/qwen3.6-27b`, Groq's vision-capable model).

**Security note:** this calls Groq's API directly from the browser, so the key ships inside the client bundle and is visible to anyone who opens dev tools. Fine for local/personal use; not safe for a publicly deployed multi-user app without a backend proxy in front of it.

## Architecture

`VITE_BASE44_APP_ID` in `.env` points at the real Base44 app. Data lives in three entities discovered by reverse-engineering the live app's network requests:

- **Hunt** — `title`, `description`, `difficulty`, `cover_image`, `status`, `total_clues`, `join_code`
- **Clue** — `hunt_id`, `location_name`, `location_map_query`, `hint_text`, `location_description`, `order`, `reference_image_url`
- **PlayerProgress** — `player_id`, `hunt_id`, `status`, `current_clue_order`, `completed_clues`, `scan_attempts`

### A security fix worth knowing about

The app owner's Base44 "API key" (the `headers: { api_key }` pattern shown in Base44's own docs) turned out to **authenticate every request as the app owner's account** — verified directly: passing it made `auth.me()` return the owner's identity with no login step at all. That's an owner-level credential, not a scoped public key, so it must never ship in client-side code (anyone who opened dev tools on a deployed build would get full read/write access to the real account). This app deliberately uses **no API key at all** — just `appId` for anonymous reads of public entities (Hunt, Clue both allow this) and normal per-user email/password login for everything else. If you're extending this, don't reintroduce that header.

### Known limitations

- **Score, hints, and badges are local-only.** The real `PlayerProgress` schema has no fields for them, so they're computed client-side from `completed_clues` + timestamps and won't follow you to another browser.
- **GPS coordinates aren't stored.** The real `Clue` schema has no lat/lng — only `location_map_query`, a text description. The GPS proximity check geocodes that text live (via free Nominatim) each time it's needed instead of using a stored coordinate.
- **Leaderboard cross-user visibility is unverified.** `PlayerProgress` requires login to read at all (confirmed), but whether a logged-in user can see *other* users' completed runs depends on entity access rules configured in the Base44 editor, which isn't something I have visibility into. It'll show real data from your own account either way.
- **Drafts are local-only** (never sent to Base44 until you hit Publish), visible only in the browser that created them, under My Hunts → "Your drafts."

## Tech stack

Vite + React + TypeScript + Tailwind CSS v4, React Router, Zustand for state, `@base44/sdk` for the backend, Leaflet + OpenStreetMap for location search (free, no API key), `qrcode.react`, `canvas-confetti`, `lucide-react` for icons.

## Android (APK)

The web app is wrapped as a native Android app via [Capacitor](https://capacitorjs.com) (package `com.lumahunt.app`) — see `capacitor.config.ts` and the `android/` project. Requires the Android SDK, `ANDROID_HOME` set, and a JDK compatible with the Android Gradle Plugin (JDK 21 confirmed working; newer JDKs may hit a `jlink`/`androidJdkImage` incompatibility with this AGP version).

```bash
npm run build            # build the web assets into dist/
npx cap sync android      # copy them + config into the native project
cd android
JAVA_HOME=/path/to/jdk-21 ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk` — install it on a device/emulator with `adb install -r <path>`, or copy it over directly. It's a debug build (unsigned, not for Play Store — that needs a release signing config and a keystore, which isn't set up here).

**Camera and location permissions are declared** in `AndroidManifest.xml` for the photo-scan and GPS-proximity features. Not yet verified running on an actual device/emulator — only that the build succeeds and the manifest/permissions are correct (checked via `aapt dump badging`).

## Access it here:
https://treasure-hunt-app-phi.vercel.app

