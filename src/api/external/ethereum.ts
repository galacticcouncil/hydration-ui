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

type LidoEthApr = number | undefined

export const fetchLIDOEthAPR = async () => {
  const res = await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/sma")
  const data = await res.json()

  return data?.data?.smaApr as number | undefined
}

export const useLIDOEthAPR = (options: UseQueryOptions<LidoEthApr> = {}) => {
  return useQuery<LidoEthApr>(QUERY_KEYS.lidoEthAPR, fetchLIDOEthAPR, {
    refetchOnWindowFocus: false,
    staleTime: millisecondsInHour,
    ...options,
  })
}
