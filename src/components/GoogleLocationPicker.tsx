import { useRef, useState } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { Search } from "lucide-react";
import { useGoogleMaps } from "../lib/googleMaps";

// Muted night-mode style so the embedded map matches the app's navy/gold theme
// instead of dropping a bright white rectangle into a dark glass card.
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a2540" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1729" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#22304f" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1c3a2e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a3958" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a2540" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a4a72" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#22304f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1c33" }] },
];

interface Position {
  lat: number;
  lng: number;
}

interface GoogleLocationPickerProps {
  value: string;
  onChange: (locationQuery: string) => void;
}

export function GoogleLocationPicker({ value, onChange }: GoogleLocationPickerProps) {
  const googleMaps = useGoogleMaps();
  const [input, setInput] = useState(value);
  const [marker, setMarker] = useState<Position | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  function commit(text: string, position: Position) {
    setInput(text);
    setMarker(position);
    onChange(text);
  }

  function handlePlaceChanged() {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;
    commit(place.formatted_address || place.name || input, { lat: location.lat(), lng: location.lng() });
  }

  function reverseGeocode(position: Position) {
    geocoderRef.current ??= new google.maps.Geocoder();
    geocoderRef.current.geocode({ location: position }, (results, status) => {
      const text =
        status === "OK" && results?.[0]
          ? results[0].formatted_address
          : `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
      commit(text, position);
    });
  }

  if (googleMaps?.loadError) {
    return (
      <p className="text-xs text-rose-400">
        Google Maps failed to load — check that VITE_GOOGLE_MAPS_API_KEY is valid and the Maps
        JavaScript API + Places API are enabled for it.
      </p>
    );
  }

  if (!googleMaps?.isLoaded) {
    return <div className="input-glass flex h-10 items-center text-sm text-slate-400">Loading map…</div>;
  }

  return (
    <div className="space-y-2">
      <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={handlePlaceChanged}>
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for a place (e.g. Eiffel Tower, Paris)"
            className="input-glass w-full pr-9"
          />
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
        </div>
      </Autocomplete>

      <div className="glass h-48 overflow-hidden rounded-lg">
        <GoogleMap
          center={marker ?? { lat: 20, lng: 0 }}
          zoom={marker ? 15 : 2}
          onClick={(e) => e.latLng && reverseGeocode({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
          mapContainerClassName="h-full w-full"
          options={{ disableDefaultUI: true, zoomControl: true, styles: DARK_MAP_STYLE }}
        >
          {marker && (
            <Marker
              position={marker}
              draggable
              onDragEnd={(e) => e.latLng && reverseGeocode({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
            />
          )}
        </GoogleMap>
      </div>
      <p className="text-xs text-slate-400">
        Search, or click the map (and drag the pin) to fine-tune. Stored as text, matching Luma
        Hunt's real schema.
      </p>
    </div>
  );
}
