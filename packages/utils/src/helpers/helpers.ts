import { isNullish } from "remeda"

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const openUrl = (url: string, target = "_blank") => {
  window.open(url, target)
}

export const isHexColor = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

export const hexToRgba = (hex: string, alpha = 1): string => {
  if (!isHexColor(hex)) return ""
  const hexValue = hex.replace("#", "")
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const stringEquals = (
  a: string,
  b: string,
  caseSensitive: boolean = false,
): boolean => {
  if (caseSensitive) {
    return a === b
  }

  return a.toLowerCase() === b.toLowerCase()
}

export const updateQueryString = (
  param: string,
  value?: string | number | null,
) => {
  const url = new URL(window.location.href)
  if (isNullish(value)) {
    url.searchParams.delete(param)
  } else {
    url.searchParams.set(param, value.toString())
  }
  window.history.replaceState({}, "", url.toString())
}

export const createQueryString = (
  params: Record<string, string | number>,
): string => {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const getRdnsFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.split(".").reverse().slice(0, 2).join(".")
  } catch {
    return ""
  }
}

export const noop = () => {}
