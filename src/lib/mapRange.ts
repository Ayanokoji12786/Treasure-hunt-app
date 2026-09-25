/** Piecewise-linear interpolation, clamped at the ends — the same semantics as
 * Motion's useTransform(value, range, output), evaluated eagerly against a plain
 * number. Shared by Landing's scroll choreography and the 3D terrain camera rig. */
export function mapRange(value: number, range: number[], output: number[]): number {
  if (value <= range[0]) return output[0];
  const last = range.length - 1;
  if (value >= range[last]) return output[last];
  for (let i = 0; i < last; i++) {
    if (value >= range[i] && value <= range[i + 1]) {
      const t = (value - range[i]) / (range[i + 1] - range[i]);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[last];
}
