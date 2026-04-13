const NB_SPACE = String.fromCharCode(160)

export function formatNumber(value: number, decimals = 2): string {
  const parts = value.toFixed(decimals).split(".")
  parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, NB_SPACE) ?? ""
  return parts.join(".")
}

export function formatInputDisplay(value: string): string {
  if (!value) return ""
  const parts = value.split(".")
  parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? ""
  return parts.join(".")
}

export function formatDays(days: number): string {
  if (days <= 0) return "Ready"
  if (days === 1) return "1 day"
  return `${Math.ceil(days)} days`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}
