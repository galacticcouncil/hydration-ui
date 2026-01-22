import { capitalize } from "remeda"

export const parseIndexerUrlName = (url: string) => {
  const { rawName } = /:(?<rawName>[^:]+)\/api\/graphql/.exec(url)?.groups ?? {}

  if (!rawName) {
    return ""
  }

  const formatted = rawName
    .split("-")
    .map((word) => capitalize(word))
    .join(" ")

  return formatted
}
