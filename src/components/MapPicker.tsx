import { useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`,
      );
      const results = await res.json();
      if (results[0]) {
        onChange(parseFloat(results[0].lat), parseFloat(results[0].lon));
      }
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a place (e.g. Eiffel Tower, Paris)"
          className="flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          🔍
        </button>
      </form>
      <div className="h-56 overflow-hidden rounded-lg border border-sand-200 dark:border-neutral-700">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          key={`${lat}-${lng}`}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} />
          <ClickHandler onChange={onChange} />
        </MapContainer>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Click the map to drop a pin, or search above. {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  );
}
