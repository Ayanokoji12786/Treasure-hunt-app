# Luma Hunt

> A real-world, AI-verified scavenger hunt application built with React, Base44, Groq Vision AI, and Capacitor.

Luma Hunt turns physical locations into interactive scavenger hunts. A hunt consists of a sequence of real-world locations, each accompanied by a riddle-style clue. Players travel to each location and submit a photograph of their surroundings. AI verifies whether the photograph plausibly matches the intended location before allowing the player to continue.

The application uses a live Base44 backend, meaning hunts, clues, user accounts, and player progress are persisted remotely and shared across devices.

---

## Table of Contents

* [How It Works](#how-it-works)
* [Core Game Loop](#core-game-loop)
* [Application Screens](#application-screens)
* [AI Photo Verification](#ai-photo-verification)
* [GPS Proximity Checking](#gps-proximity-checking)
* [Scoring System](#scoring-system)
* [Architecture](#architecture)
* [Data Model](#data-model)
* [Authentication](#authentication)
* [Local vs Server Data](#local-vs-server-data)
* [Security](#security)
* [Technology Stack](#technology-stack)
* [Running Locally](#running-locally)
* [Deployment](#deployment)
* [Android Build](#android-build)
* [Known Limitations](#known-limitations)

---

# How It Works

Luma Hunt has two fundamental parts:

1. **Hunt creation** — someone creates a sequence of real-world locations and clues.
2. **Hunt participation** — players solve those clues by physically finding the locations and proving their discovery with photographs.

A typical hunt works like this:

```text
Creator
   │
   ▼
Creates Hunt
   │
   ├── Title
   ├── Description
   ├── Difficulty
   └── Clues
        │
        ├── Location
        ├── Riddle / Hint
        ├── Private AI description
        └── Optional reference image
   │
   ▼
Publish
   │
   ▼
Base44 Backend
   │
   ▼
6-character Join Code
   │
   ▼
Player
   │
   ▼
Solves Current Clue
   │
   ▼
Travels to Location
   │
   ├── GPS proximity check
   │
   ▼
Takes Photograph
   │
   ▼
Groq Vision AI
   │
   ├── Correct → Unlock next clue
   │
   └── Rejected → Explain why + retry
   │
   ▼
Final Clue
   │
   ▼
Hunt Completed
   │
   ▼
Score + Leaderboard
```

The important design principle is that **clues are sequential**. A player cannot simply skip ahead; the next clue becomes available only after the current one has been successfully completed.

---

# Core Game Loop

## 1. Create a Hunt

A creator provides:

* Hunt title
* Description
* Difficulty
* Cover image
* One or more clues

Each clue contains:

* Location name
* Location search/query
* Player-facing hint
* Private location description
* Optional reference image

The private description is particularly important because it is later supplied to the AI during photo verification.

---

## 2. Publish the Hunt

Publishing sends the hunt to the Base44 backend.

The backend generates a **6-character join code**, such as:

```text
TRAIL7
```

The code can then be shared with other players or represented as a QR code.

---

## 3. Player Joins

Players can enter a hunt in two ways:

### Join code

They enter the six-character code directly.

### Explore

They browse publicly available hunts and select one.

Both paths ultimately take the player to the hunt detail/gameplay screen.

---

## 4. Solve the Current Clue

Only the current clue is revealed.

Future clues remain locked until the player completes the current one.

The gameplay screen displays:

* Current clue
* Optional AI-verification hint
* Distance from the target
* Camera button
* Progress through the hunt

---

## 5. Find the Physical Location

The player travels to the location described by the clue.

Luma Hunt performs a GPS proximity check to determine how far the player is from the target.

Importantly, this is **not a hard requirement**. The player can still submit a photograph even if they are more than 300 meters away.

---

## 6. Take a Photograph

The player selects:

**Find Treasure**

On mobile, this opens the camera.

On desktop, the application can use a file picker instead.

The photograph is then passed to the AI verification system.

---

## 7. AI Verification

The photograph is sent to Groq's vision API.

The default model is:

```text
qwen/qwen3.6-27b
```

The AI receives three pieces of information:

```text
Location name
+
Private location description
+
Player photograph
```

The model is asked whether the photograph plausibly shows the intended location.

It returns:

* Verdict
* Confidence
* Short explanation

If the photograph is rejected, the player receives the explanation and can try again.

---

# AI Photo Verification

The private location description is deliberately separated from the public clue.

For example:

```text
Public clue:
"Where history meets the red-brick heart of the city..."

Private AI description:
"A red brick colonial building with a cupola on top."
```

The player sees the clue, while the AI receives the private description.

This allows the AI to compare the photograph against a more concrete description of what should actually be visible.

### Verification flow

```text
Camera / File Picker
        │
        ▼
Photograph
        │
        ▼
Browser
        │
        ▼
Groq Vision API
        │
        ├── Verdict
        ├── Confidence
        └── Reason
        │
        ▼
Application
        │
        ├── Accepted
        │      │
        │      ▼
        │   Complete clue
        │      │
        │      ▼
        │   Unlock next clue
        │
        └── Rejected
               │
               ▼
          Show explanation
               │
               ▼
             Retry
```

If a Groq API key is not configured, the application does **not** become unusable. Instead, photo verification is automatically accepted and the interface displays an "AI verification disabled" notice.

---

# GPS Proximity Checking

Luma Hunt does not store latitude/longitude coordinates for clues.

Instead, the clue's textual location is geocoded when required.

For example:

```text
"Central Park, New York"
```

is sent to **Nominatim**, which returns geographical coordinates.

The application then compares:

```text
Player GPS coordinates
          vs.
Target coordinates
```

using a **Haversine distance calculation**.

The threshold is:

```text
300 meters
```

If the player is farther away, the application recommends moving closer.

However:

> GPS proximity is advisory rather than a gate.

This allows the application to remain usable during development, testing, and situations where location permission is unavailable.

---

# Scoring System

Each completed clue starts with:

```text
100 points
```

The hunt's difficulty modifies this value.

| Difficulty | Multiplier |
| ---------- | ---------: |
| Easy       |       ×1.0 |
| Medium     |       ×1.4 |
| Hard       |       ×1.8 |

The score is calculated approximately as:

```text
score =
    (completed clues × 100 × difficulty multiplier)
    − (revealed hints × 15)
    + speed bonus
```

The final score cannot go below zero.

### Speed bonus

```text
max(0, 300 − elapsedSeconds / 5)
```

Therefore, faster completion produces a larger bonus, while the bonus gradually disappears as the hunt takes longer.

---

# Badges

Badges are based purely on the number of completed hunts.

| Badge           | Requirement |
| --------------- | ----------: |
| First Steps     |      1 hunt |
| Trailblazer     |     3 hunts |
| Master Explorer |     5 hunts |

---

# Application Screens

## `/`

### Landing

The main entry point for logged-out users.

Users can:

* Create a Hunt
* Join a Hunt
* Explore public hunts

---

## `/register`

## `/login`

Real Base44 authentication using:

* Email/password
* Email verification
* Google OAuth

This is not a simulated authentication system.

---

## `/forgot-password`

Allows users to request a genuine password-reset email.

The application can process either:

```text
Raw reset token
```

or:

```text
Complete reset URL
```

and extract the token when necessary.

---

## `/explore`

Displays published hunts retrieved from Base44.

Users can:

* Search by name/description
* Filter by difficulty
* Open a hunt

---

## `/create-hunt`

The hunt creation interface.

Creators configure the hunt and its clues.

### Save as Draft

Drafts remain **only in the browser**.

They are not uploaded to Base44 until the creator publishes the hunt.

### Publish

Publishing creates the persistent backend records and makes the hunt available to other users.

---

## `/join`

Accepts a six-character hunt code and navigates directly to that hunt.

---

## `/hunt/:id`

The primary gameplay screen.

It handles:

* Hunt information
* Starting the hunt
* Current clue
* AI hint
* GPS distance
* Photo scanning
* Clue progression
* Completion

---

## `/my-hunts`

Displays:

* In-progress hunts
* Completed hunts
* Local drafts

---

## `/leaderboard`

Displays completed runs ranked by score, together with the hunt name and completion time.

---

## `/profile`

Displays:

* Completed hunts
* In-progress hunts
* Clues solved
* Achievement badges

---

# Architecture

Luma Hunt intentionally does **not** use a custom backend server.

The architecture is essentially:

```text
                    ┌──────────────────┐
                    │   React + Vite   │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      ┌───────────────┐             ┌───────────────┐
      │    Base44     │             │     Groq      │
      │    Backend    │             │   Vision AI   │
      └───────────────┘             └───────────────┘
              │
              ▼
       Shared application
            data
```

There is no custom Node/Express/FastAPI/etc. server sitting between the frontend and these services.

The browser communicates directly with:

### Base44

Responsible for persistent application data:

* Hunts
* Clues
* Accounts
* Player progress

### Groq

Responsible for:

* Photograph analysis
* Vision verification

---

# Security

One of the important architectural decisions in this project concerns Base44 authentication.

The standard Base44 API-key mechanism was found to authenticate requests as the application owner's account.

That means exposing such a key in a public frontend bundle would effectively expose an owner-level credential.

Luma Hunt therefore deliberately **does not ship the Base44 API key**.

Instead:

```text
Public hunt reads
        ↓
App ID

Authenticated operations
        ↓
Normal user authentication
```

This prevents an owner-level Base44 credential from being embedded into the public client application.

> Note: the Groq API key is currently described as client-side. For a production deployment, API credentials should ideally be protected behind a server-side proxy or equivalent secure mechanism.

---

# Data Model

The actual persistent Base44 schema contains three important entities.

## Hunt

```text
Hunt
├── title
├── description
├── difficulty
├── cover_image
├── status
├── total_clues
└── join_code
```

## Clue

```text
Clue
├── hunt_id
├── location_name
├── location_map_query
├── hint_text
├── location_description
├── order
└── reference_image_url
```

## PlayerProgress

```text
PlayerProgress
├── player_id
├── hunt_id
├── status
├── current_clue_order
├── completed_clues
└── scan_attempts
```

---

# Local vs Server Data

Not everything in Luma Hunt is stored in Base44.

This distinction is important.

## Server-side data

Shared between sessions/devices:

```text
Hunt
Clue
PlayerProgress
User account
```

## Browser-local data

Stored locally:

```text
Score
Hint usage
GPS information
Unpublished drafts
```

This creates an intentional **local overlay** on top of the persistent Base44 data.

For example:

```text
Base44
   │
   ├── Hunt
   ├── Clues
   └── Player progress
          │
          ▼
      React app
          │
          ├── Local score
          ├── Hint tracking
          └── GPS state
```

---

# Authentication

There are three authentication paths.

### 1. Email + Password

Registration triggers a real verification process using a one-time code.

The user must verify the account before logging in.

### 2. Google OAuth

The application redirects through Base44's OAuth flow and returns to the application authenticated.

### 3. Password Reset

The user receives a real reset email containing a reset token/link.

---

# Technology Stack

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| React           | UI framework                |
| Vite            | Development/build system    |
| TypeScript      | Type safety                 |
| Tailwind CSS v4 | Styling                     |
| React Router    | Client-side routing         |
| Zustand         | Application state           |
| Base44 SDK      | Backend/data/authentication |
| Groq            | AI photo verification       |
| Qwen Vision     | Image understanding         |
| Leaflet         | Mapping                     |
| OpenStreetMap   | Map data                    |
| Nominatim       | Geocoding                   |
| qrcode.react    | QR generation               |
| canvas-confetti | Completion animation        |
| Lucide          | Icons                       |
| Capacitor       | Android wrapper             |

---

# Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application requires:

```text
VITE_BASE44_APP_ID
```

in the `.env` file.

Groq is optional:

```text
VITE_GROQ_API_KEY
```

If the Groq key is absent, photo verification automatically falls back to acceptance mode with a visible disabled-verification notice.

Example:

```env
VITE_BASE44_APP_ID=your_base44_app_id
VITE_GROQ_API_KEY=your_groq_api_key
```

---

# Deployment

The project produces a static Vite build.

It can be deployed to services such as Vercel.

A `vercel.json` rewrite is included so React Router routes continue working correctly when users directly visit paths such as:

```text
/hunt/123
/profile
/explore
```

---

# Android

The web application can also be packaged as an Android application using Capacitor.

The Android application identifier is:

```text
com.lumahunt.app
```

A debug APK can be built using:

```bash
./gradlew assembleDebug
```

---

# Known Limitations

## 1. Scores are device-local

Score and hint tracking are not stored as shared backend data.

Therefore, changing browsers or devices can cause these values to reset.

The underlying hunt progress remains persistent.

## 2. GPS coordinates are not stored

Every proximity check must geocode the location text again.

This introduces dependence on Nominatim availability and geocoding accuracy.

## 3. Leaderboard visibility depends on Base44 permissions

The application confirms that progress requires authentication, but cross-user visibility of completed runs depends on the access rules configured within Base44.

## 4. Drafts are browser-local

A draft is not a server-side private hunt.

It is simply an unsaved local copy until the creator publishes it.

---

# End-to-End Example

Suppose a creator makes a hunt called:

```text
Historic Hyderabad
```

with three clues.

### Creator

```text
Create Hunt
     ↓
Add 3 locations
     ↓
Add riddles
     ↓
Add private AI descriptions
     ↓
Publish
     ↓
Base44
     ↓
Join code: HYD123
```

### Player

```text
Enter HYD123
       ↓
Start hunt
       ↓
Clue #1
       ↓
Travel to location
       ↓
GPS says 120m away
       ↓
Take photo
       ↓
Groq Vision
       ↓
Photo matches description
       ↓
Clue #2 unlocked
       ↓
...
       ↓
Clue #3 completed
       ↓
Hunt completed
       ↓
Score calculated
       ↓
Leaderboard
```

This is the fundamental architecture of Luma Hunt: **persistent shared hunt data through Base44, client-side game state and scoring, optional GPS guidance, and AI-assisted visual verification through Groq.**


## Access it here:
https://treasure-hunt-app-phi.vercel.app

