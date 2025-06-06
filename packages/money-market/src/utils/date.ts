type TimeUnit = "day" | "month" | "year"
type Operation = "add" | "subtract"

export function toUnixTimestamp(date: Date | number): number {
  const ts = typeof date === "number" ? date : date.getTime()
  return Math.floor(ts / 1000)
}

export function getAdjustedTimestamp(
  date: Date,
  value: number = 0,
  unit: TimeUnit = "day",
  operation: Operation = "subtract",
): number {
  const modifier = operation === "add" ? 1 : -1
  const adjustedValue = value * modifier

  switch (unit) {
    case "day":
      date.setDate(date.getDate() + adjustedValue)
      break
    case "month":
      date.setMonth(date.getMonth() + adjustedValue)
      break
    case "year":
      date.setFullYear(date.getFullYear() + adjustedValue)
      break
  }

  return date.getTime()
}
