const cache = new Map<string, { lat: number; lng: number } | null>();

export async function geocodeQuery(query: string): Promise<{ lat: number; lng: number } | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
  );
  // Rate-limit/error responses aren't JSON — don't cache them as "not found", so a
  // later retry can still succeed.
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const results = await res.json();
  const result = results[0]
    ? { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
    : null;
  cache.set(key, result);
  return result;
}
