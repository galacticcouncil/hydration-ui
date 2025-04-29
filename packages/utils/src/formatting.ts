export function shorten(string: string, fromStart = 10, fromEnd = 0) {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length <= fromStart + fromEnd + 1) {
    return string
  }

  const start = string.slice(0, fromStart).trim()
  const end = fromEnd > 0 ? string.slice(fromEnd * -1) : ""

  return fromStart > 0 ? `${start}...${end}` : string
}

export function shortenAccountAddress(address: string, length = 6) {
  return shorten(address, length, length)
}
