import { queryOptions } from "@tanstack/react-query"

import { getDefaultDataEnv } from "@/api/rpcConfig"

type NearAccountResponse = {
  result?: { amount: string }
  error?: { cause?: { name?: string } }
}

export const nearAccountQuery = (address: string) =>
  queryOptions({
    queryKey: ["near", "account", getDefaultDataEnv(), address],
    queryFn: async ({ signal }) => {
      const network = getDefaultDataEnv()
      const response = await fetch(`https://rpc.${network}.near.org`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "recipient-check",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: address,
          },
        }),
        signal,
      })

      if (!response.ok) throw new Error("NEAR account lookup failed")

      const account = (await response.json()) as NearAccountResponse

      if (account.result) return true
      if (account.error?.cause?.name === "UNKNOWN_ACCOUNT") return false

      throw new Error("NEAR account lookup failed")
    },
    retry: 1,
    staleTime: 15_000,
  })
