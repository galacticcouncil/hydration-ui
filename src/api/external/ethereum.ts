import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmChain } from "@galacticcouncil/xcm-core"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns"
import { QUERY_KEYS } from "utils/queryKeys"

export const ethereum = chainsMap.get("ethereum") as EvmChain
export const ethereumNativeToken = ethereum.assetsData.get("eth")!

type TAccountBalance = Awaited<ReturnType<typeof fetchEthereumAccountBalance>>

const fetchEthereumAccountBalance = async (address: string) => {
  if (!ethereum.client) throw new Error("Ethereum is not connected")

  const provider = ethereum.client.getProvider()
  const balance = await provider.getBalance({
    address: address as `0x${string}`,
  })
  return {
    amount: balance.toString(),
    decimals: ethereumNativeToken.decimals,
    symbol: ethereumNativeToken.asset.originSymbol,
  }
}

export const useEthereumAccountBalance = (
  address: string,
  options: UseQueryOptions<TAccountBalance> = {},
) => {
  return useQuery<TAccountBalance>(
    QUERY_KEYS.ethereumAccountBalance(address),
    async () => fetchEthereumAccountBalance(address),
    {
      enabled: !!address,
      ...options,
    },
  )
}

export const fetchLIDOEthAPR = async (): Promise<number> => {
  const res = await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/sma")
  const data = await res.json()
  const apy = Number(data?.data?.smaApr)

  return apy || 0
}

export const lidoEthAPRQuery: UseQueryOptions<number> = {
  queryKey: QUERY_KEYS.lidoEthAPR,
  queryFn: fetchLIDOEthAPR,
  staleTime: millisecondsInHour,
  refetchOnWindowFocus: false,
}

export const useLIDOEthAPR = (options: UseQueryOptions<number> = {}) => {
  return useQuery({
    ...lidoEthAPRQuery,
    ...options,
  })
}
