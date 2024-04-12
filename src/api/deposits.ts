import { ApiPromise } from "@polkadot/api"
import { u128, u32, Option } from "@polkadot/types"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccountNFTPositions } from "sections/pools/PoolsPage.utils"
import { PalletLiquidityMiningDepositData } from "@polkadot/types/lookup"

export const useOmnipoolDeposits = (ids: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.omnipoolDeposits(ids),
    getDeposits(api, "omnipool", ids),
    { enabled: !!ids.length },
  )
}

export const useXYKDeposits = (ids: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.xykDeposits(ids), getDeposits(api, "xyk", ids), {
    enabled: !!ids.length,
  })
}

const getDeposits =
  (api: ApiPromise, type: "omnipool" | "xyk", ids: string[]) => async () => {
    if (!ids.length) return undefined

    const keys = ids.map((id) =>
      api.query[`${type}WarehouseLM`].deposit.key(id),
    )
    const values = (await api.rpc.state.queryStorageAt(
      keys,
    )) as Option<PalletLiquidityMiningDepositData>[]

    const data = values.map(
      (value) =>
        api.registry.createType(
          type === "omnipool" ? "OmnipoolLMDeposit" : "XykLMDeposit",
          value.unwrap(),
        ) as PalletLiquidityMiningDepositData,
    )

    const test = ids.map((id, i) => ({ id, data: data[i] }))

    return test
  }

export const useOmniPositionIds = (positionIds: Array<u32 | string>) => {
  const { api } = useRpcProvider()

  return useQueries({
    queries: positionIds.map((id) => ({
      queryKey: QUERY_KEYS.omniPositionId(id.toString()),
      queryFn: getOmniPositionId(api, id.toString()),
      enabled: !!positionIds.length,
    })),
  })
}
const getOmniPositionId =
  (api: ApiPromise, depositionId: u128 | string) => async () => {
    const res =
      await api.query.omnipoolLiquidityMining.omniPositionId(depositionId)
    return { depositionId, value: res.value }
  }

export const useUserDeposits = (address?: string) => {
  const nftPositions = useAccountNFTPositions(address)

  const { miningNfts = [], xykMiningNfts = [] } = nftPositions.data ?? {}
  const omnipoolDeposits =
    useOmnipoolDeposits(miningNfts.map((miningNft) => miningNft.instanceId))
      .data ?? []

  const xykDeposits =
    useXYKDeposits(xykMiningNfts.map((xykMiningNft) => xykMiningNft.instanceId))
      .data ?? []

  return { omnipoolDeposits, xykDeposits }
}
