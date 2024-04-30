import { ApiPromise } from "@polkadot/api"
import { u128, u32, Option } from "@polkadot/types"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { PalletLiquidityMiningDepositData } from "@polkadot/types/lookup"
import { useAccountOmnipoolPositions } from "sections/pools/PoolsPage.utils"

export const useOmnipoolDeposits = (ids: string[]) => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.omnipoolDeposits(ids), getDeposits(api, ids), {
    enabled: !!ids.length,
  })
}

export const useOmniPositionId = (positionId: u128 | string) => {
  const { api } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.omniPositionId(positionId),
    getOmniPositionId(api, positionId),
  )
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

const getDeposits = (api: ApiPromise, ids: string[]) => async () => {
  if (!ids.length) return undefined

  const keys = ids.map((id) => api.query.omnipoolWarehouseLM.deposit.key(id))
  const values = (await api.rpc.state.queryStorageAt(
    keys,
  )) as Option<PalletLiquidityMiningDepositData>[]

  const data = values
    .filter((value) => !value.isNone)
    .map(
      (value) =>
        api.registry.createType(
          "OmnipoolLMDeposit",
          value.unwrap(),
        ) as PalletLiquidityMiningDepositData,
    )

  return ids.map((id, i) => ({ id, data: data[i] }))
}

const getOmniPositionId =
  (api: ApiPromise, depositionId: u128 | string) => async () => {
    const res =
      await api.query.omnipoolLiquidityMining.omniPositionId(depositionId)
    return { depositionId, value: res.value }
  }

export const useUserDeposits = (address?: string) => {
  const nftPositions = useAccountOmnipoolPositions(address)

  const { miningNfts = [] } = nftPositions.data ?? {}

  const omnipoolDeposits =
    useOmnipoolDeposits(
      miningNfts.map((miningNft) => miningNft.instanceId),
    ).data?.filter((deposit) => deposit.data) ?? []

  return omnipoolDeposits
}
