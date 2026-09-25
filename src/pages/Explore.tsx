import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { motion } from "motion/react";
import { GripHorizontal, Search } from "lucide-react";
import { useHuntStore } from "../store/huntStore";
import { HuntCard } from "../components/HuntCard";
import { LoadingScreen } from "../components/LoadingScreen";
import { usePageLoader } from "../hooks/usePageLoader";
import { geocodeQuery } from "../lib/geocode";
import { getCurrentPosition } from "../lib/geo";
import { haversineMeters } from "../lib/geo";
import { huntWaypointIcon, userLocationIcon } from "../lib/mapIcons";
import type { Difficulty } from "../types";

const FILTERS: Array<Difficulty | "all"> = ["all", "easy", "medium", "hard"];
// CARTO's free dark basemap started returning "API KEY REQUIRED" watermarked tiles, so
// this uses the standard OpenStreetMap tiles (no key) and darkens them in CSS instead
// — see .luma-dark-tiles in index.css.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type LatLng = { lat: number; lng: number };

function RecenterOnce({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
    // Only the first resolved center should move the map — re-centering on every
    // pin update as more hunts geocode in would yank the view around underfoot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function Explore() {
  const hunts = useHuntStore((s) => s.hunts);
  const loadingHunts = useHuntStore((s) => s.loadingHunts);
  const huntsError = useHuntStore((s) => s.huntsError);
  const loadHunts = useHuntStore((s) => s.loadHunts);
  const explorerCounts = useHuntStore((s) => s.explorerCounts);
  const loadExplorerCounts = useHuntStore((s) => s.loadExplorerCounts);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [pins, setPins] = useState<Record<string, LatLng | null>>({});
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [mapPeek, setMapPeek] = useState(false);
  const navigate = useNavigate();
  const { loaderVisible, hideLoader } = usePageLoader();

  useEffect(() => {
    loadHunts();
    loadExplorerCounts().catch(() => {});
    getCurrentPosition()
      .then((p) => setUserPos({ lat: p.lat, lng: p.lng }))
      .catch(() => {});
  }, [loadHunts, loadExplorerCounts]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const hunt of hunts) {
        if (cancelled) return;
        const q = hunt.clues[0]?.locationQuery;
        if (!q) continue;
        try {
          const pos = await geocodeQuery(q);
          if (!cancelled) setPins((prev) => ({ ...prev, [hunt.id]: pos }));
        } catch {
          if (!cancelled) setPins((prev) => ({ ...prev, [hunt.id]: null }));
        }
        // Nominatim's free tier asks for ~1 req/sec — a small stagger keeps this a
        // good citizen even when many hunts geocode in on a single page load.
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    if (hunts.length) run();
    return () => {
      cancelled = true;
    };
  }, [hunts]);

  const withDistance = useMemo(
    () =>
      hunts.map((hunt) => {
        const pin = pins[hunt.id];
        const distanceKm =
          userPos && pin ? haversineMeters(userPos.lat, userPos.lng, pin.lat, pin.lng) / 1000 : undefined;
        return { hunt, distanceKm };
      }),
    [hunts, pins, userPos],
  );

  const filtered = withDistance.filter(({ hunt }) => {
    const matchesQuery =
      hunt.title.toLowerCase().includes(query.toLowerCase()) ||
      hunt.description.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = difficulty === "all" || hunt.difficulty === difficulty;
    return matchesQuery && matchesDifficulty;
  });

  const trending = [...filtered].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  const firstPin = Object.values(pins).find((p): p is LatLng => !!p);
  const initialCenter = userPos ?? firstPin ?? { lat: 20, lng: 0 };
  const initialZoom = userPos ? 12 : firstPin ? 11 : 2;

  return (
    <div className="relative">
      {loaderVisible && <LoadingScreen active={loadingHunts} context="explore" onDone={hideLoader} />}

      <div className="relative h-[55vh] w-full sm:h-[72vh]">
        <MapContainer center={[initialCenter.lat, initialCenter.lng]} zoom={initialZoom} className="h-full w-full" zoomControl={false}>
          <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} className="luma-dark-tiles" />
          <RecenterOnce center={initialCenter} zoom={initialZoom} />
          {userPos && (
            <Marker position={[userPos.lat, userPos.lng]} icon={userLocationIcon()} />
          )}
          {filtered.map(({ hunt }) => {
            const pin = pins[hunt.id];
            if (!pin) return null;
            return (
              <Marker
                key={hunt.id}
                position={[pin.lat, pin.lng]}
                icon={huntWaypointIcon()}
                eventHandlers={{ click: () => navigate(`/hunt/${hunt.id}`) }}
              />
            );
          })}
        </MapContainer>

        {/* Floating search/filter overlay — a legitimate map-overlay-control glass use */}
        <div className="glass absolute left-1/2 top-4 z-[1000] w-[92%] max-w-md -translate-x-1/2 rounded-[var(--radius-luma-lg)] p-2.5">
          <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hunts or locations"
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="mt-2 flex justify-center gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setDifficulty(f)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  difficulty === f ? "bg-sky-400/20 text-sky-400" : "text-slate-300 hover:bg-white/8"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop trending rail, overlaid on the map per the map-first layout */}
        <div className="glass absolute inset-x-4 bottom-4 z-[1000] hidden rounded-[var(--radius-luma-lg)] p-4 sm:block">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Trending near you</p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {!loadingHunts && trending.slice(0, 8).map(({ hunt, distanceKm }) => (
              <div key={hunt.id} className="w-56 shrink-0">
                <HuntCard hunt={hunt} distanceKm={distanceKm} explorerCount={explorerCounts[hunt.id]} />
              </div>
            ))}
            {!loadingHunts && trending.length === 0 && (
              <p className="py-6 text-sm text-slate-400">No hunts match your search.</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: drag the handle to shrink the map and see more of the list */}
      <motion.button
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, info) => {
          if (info.offset.y < -18) setMapPeek(true);
          else if (info.offset.y > 18) setMapPeek(false);
        }}
        onClick={() => setMapPeek((v) => !v)}
        className="surface-1 -mt-4 flex w-full touch-none flex-col items-center gap-1 rounded-t-[var(--radius-luma-lg)] border-b-0 pb-1 pt-2.5 sm:hidden"
        aria-label={mapPeek ? "Show map" : "Show more hunts"}
      >
        <GripHorizontal className="h-4 w-4 text-slate-600" strokeWidth={2} />
      </motion.button>
      <style>{`@media (max-width: 639px) { .leaflet-container { height: ${mapPeek ? "28vh" : "55vh"} !important; transition: height 450ms cubic-bezier(0.22,1,0.36,1); } }`}</style>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:hidden">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Around you</p>
        <div className="space-y-4">
          {loadingHunts && <p className="text-center text-sm text-slate-400">Loading hunts…</p>}
          {!loadingHunts && huntsError && (
            <div className="surface-1 rounded-[var(--radius-luma-md)] p-4 text-center">
              <p className="text-sm text-rose-400">{huntsError}</p>
              <button onClick={() => loadHunts()} className="mt-2 text-sm font-medium text-sky-400">
                Retry
              </button>
            </div>
          )}
          {!loadingHunts &&
            !huntsError &&
            trending.map(({ hunt, distanceKm }) => (
              <HuntCard key={hunt.id} hunt={hunt} distanceKm={distanceKm} explorerCount={explorerCounts[hunt.id]} />
            ))}
          {!loadingHunts && !huntsError && trending.length === 0 && (
            <p className="text-center text-sm text-slate-400">No hunts match your search.</p>
          )}
        </div>
      </div>

      {/* Desktop: full grid below the map, for anything past the trending rail */}
      <div className="mx-auto hidden max-w-5xl px-4 py-10 sm:block">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">All hunts</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!loadingHunts && huntsError && (
            <div className="surface-1 col-span-full rounded-[var(--radius-luma-md)] p-4 text-center">
              <p className="text-sm text-rose-400">{huntsError}</p>
              <button onClick={() => loadHunts()} className="mt-2 text-sm font-medium text-sky-400">
                Retry
              </button>
            </div>
          )}
          {!loadingHunts &&
            !huntsError &&
            filtered.map(({ hunt, distanceKm }) => (
              <HuntCard key={hunt.id} hunt={hunt} distanceKm={distanceKm} explorerCount={explorerCounts[hunt.id]} />
            ))}
          {!loadingHunts && !huntsError && filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-400">No hunts match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
