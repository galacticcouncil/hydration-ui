export const parseIndexerUrlName = (url: string) => {
  const match = url.match(/:([^:]+)\/api\/graphql/)

  if (!match || !match[1]) {
    return ""
  }

  const rawName = match[1]

  const formatted = rawName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return formatted
}
