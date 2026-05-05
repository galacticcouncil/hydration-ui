import { hydration, HydrationQueries } from "@galacticcouncil/descriptors"
import { queryOptions } from "@tanstack/react-query"
import { Binary, TypedApi } from "polkadot-api"
import { mapValues, pick, pipe } from "remeda"

type IdentityRaw = HydrationQueries["Identity"]["IdentityOf"]["Value"]

const IDENTITY_INFO_FIELDS = [
  "display",
  "legal",
  "web",
  "email",
  "twitter",
] as const

type IdentityInfo = {
  [K in (typeof IDENTITY_INFO_FIELDS)[number]]: string
}

const DEFAULT_IDENTITY_INFO: IdentityInfo = {
  display: "",
  legal: "",
  web: "",
  email: "",
  twitter: "",
}

const parseIdentityInfo = (identity: IdentityRaw): IdentityInfo =>
  pipe(
    identity.info,
    pick(IDENTITY_INFO_FIELDS),
    mapValues((data) => {
      if (!data?.value) return ""
      if (typeof data.value === "string" && data.value.startsWith("0x")) {
        return Binary.toText(Binary.fromHex(data.value))
      }
      return data.value.toString()
    }),
  )

export const getIdentityQuery = (
  papi: TypedApi<typeof hydration>,
  address: string,
) => {
  return queryOptions({
    queryKey: ["identity", address],
    enabled: !!address,
    staleTime: Infinity,
    placeholderData: DEFAULT_IDENTITY_INFO,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const raw = await papi.query.Identity.IdentityOf.getValue(address, {
        at: "best",
      })

      if (!raw) return DEFAULT_IDENTITY_INFO

      return parseIdentityInfo(raw)
    },
  })
}
