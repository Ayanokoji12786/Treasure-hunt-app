import L from "leaflet";

/** A hunt = an undiscovered treasure site, so the map pin itself carries the gold —
 * muted by default, brightening only where DifficultyBadge/HUD already use full gold. */
export function huntWaypointIcon(isFeatured = false) {
  const size = isFeatured ? 20 : 14;
  return L.divIcon({
    className: "",
    html: `
      <div class="luma-map-pin" style="
        width:${size}px;height:${size}px;border-radius:9999px;
        background:rgba(19,25,34,0.9);
        border:2px solid var(--luma-tertiary, #C99A45);
        box-shadow:0 2px 10px rgba(0,0,0,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="width:${Math.round(size * 0.34)}px;height:${Math.round(size * 0.34)}px;border-radius:9999px;background:var(--luma-tertiary, #C99A45);display:block;"></span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** The viewer's own position — Discovery Blue, distinct from the gold treasure pins. */
export function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:14px;height:14px;border-radius:9999px;
        background:var(--luma-primary, #6BB8FF);
        border:2px solid rgba(255,255,255,0.85);
        box-shadow:0 0 0 6px rgba(107,184,255,0.18), 0 2px 8px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
