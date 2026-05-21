import { createQueryString } from "./helpers"

const MULTIX_APP_URL = "https://multix.lark.hydration.cloud"
const MULTIX_GRAPHQL_URL = "https://multix-graphql.lark.hydration.cloud/graphql"

export const multix = {
  graphql: MULTIX_GRAPHQL_URL,
  link: (
    address: string,
    query: Record<string, string | number> = {},
  ): string => {
    return `${MULTIX_APP_URL}/${createQueryString({
      network: "hydration",
      address,
      ...query,
    })}`
  },
  account: (address: string) => multix.link(address),
}
