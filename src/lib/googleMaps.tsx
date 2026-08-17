import { createContext, useContext, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

// Optional: without a key, LocationSearch falls back to the free Nominatim search
// (see LocationSearch.tsx). Get a key at https://console.cloud.google.com/google/maps-apis
// — enable "Maps JavaScript API" and "Places API", then restrict the key to your
// domain(s) under Application restrictions.
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

const PLACES_LIBRARY: "places"[] = ["places"];

interface GoogleMapsState {
  isLoaded: boolean;
  loadError?: Error;
}

const GoogleMapsContext = createContext<GoogleMapsState | null>(null);

// Mount this once around every place that might render a Google map/Autocomplete —
// the underlying script tag is only ever injected once no matter how many clue rows
// consume the context, which matters since Create Hunt renders one LocationSearch
// per clue.
export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "luma-hunt-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY as string,
    libraries: PLACES_LIBRARY,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>{children}</GoogleMapsContext.Provider>
  );
}

// Returns null when no GoogleMapsProvider is mounted (i.e. no API key configured),
// which callers use as the signal to fall back to the free search.
export function useGoogleMaps(): GoogleMapsState | null {
  return useContext(GoogleMapsContext);
}
