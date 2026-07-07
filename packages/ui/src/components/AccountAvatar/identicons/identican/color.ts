// perceived brightness of an hsl color, 0–1 (rec. 709 weights on gamma-encoded
// rgb — fine for comparing two colors, not true relative luminance)
export function lum(h: number, s: number, l: number): number {
  h = ((h % 360) + 360) % 360
  s /= 100
  l /= 100
  const f = (nn: number) => {
    const k = (nn + h / 30) % 12
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return 0.2126 * f(0) + 0.7152 * f(8) + 0.0722 * f(4)
}
