import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Search } from "lucide-react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { geocodeQuery } from "../lib/geocode";
import { useGoogleMaps } from "../lib/googleMaps";
import { GoogleLocationPicker } from "./GoogleLocationPicker";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationSearchProps {
  value: string;
  onChange: (locationQuery: string) => void;
}

export function LocationSearch(props: LocationSearchProps) {
  // Only set (via GoogleMapsProvider) when VITE_GOOGLE_MAPS_API_KEY is configured —
  // otherwise this falls back to the free Nominatim search below.
  const googleMaps = useGoogleMaps();
  if (googleMaps) return <GoogleLocationPicker {...props} />;
  return <NominatimLocationSearch {...props} />;
}

function NominatimLocationSearch({ value, onChange }: LocationSearchProps) {
  const [input, setInput] = useState(value);
  const [preview, setPreview] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const result = await geocodeQuery(input);
      if (result) {
        setPreview(result);
        onChange(input.trim());
      } else {
        setNotFound(true);
      }
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a place (e.g. Eiffel Tower, Paris)"
          className="input-glass flex-1"
        />
        <button type="submit" disabled={searching} className="btn-primary px-3 py-2">
          <Search className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
      {notFound && <p className="text-xs text-rose-400">Couldn't find that place — try a more specific search.</p>}
      {preview && (
        <div className="glass h-40 overflow-hidden rounded-lg">
          <MapContainer center={[preview.lat, preview.lng]} zoom={14} key={`${preview.lat}-${preview.lng}`} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[preview.lat, preview.lng]} />
          </MapContainer>
        </div>
      )}
      <p className="text-xs text-slate-400">
        Stored as text (matching Luma Hunt's real schema) and geocoded live for GPS proximity checks.
      </p>
    </div>
  );
}
