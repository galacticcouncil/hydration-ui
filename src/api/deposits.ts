import { ApiPromise } from "@polkadot/api"
import { u128, u32, Option } from "@polkadot/types"
import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { PalletLiquidityMiningDepositData } from "@polkadot/types/lookup"
import { undefinedNoop } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export type TDeposit = {
  id: string
  data: PalletLiquidityMiningDepositData
}

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

    const data = values
      .filter((value) => !value.isNone)
      .map(
        (value) =>
          api.registry.createType(
            type === "omnipool" ? "OmnipoolLMDeposit" : "XykLMDeposit",
            value.unwrap(),
          ) as PalletLiquidityMiningDepositData,
      )

    const data_ = ids.map((id, i) => ({
      id,
      data: data[i],
      isXyk: type === "xyk",
    }))

    return data_
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

export const useAccountNFTPositions = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api } = useRpcProvider()

  const address = givenAddress ?? account?.address

  return useQuery(
    QUERY_KEYS.accountOmnipoolPositions(address),
    address != null
      ? async () => {
          const [omnipoolNftId, miningNftId, xykMiningNftId] =
            await Promise.all([
              api.consts.omnipool.nftCollectionId,
              api.consts.omnipoolLiquidityMining.nftCollectionId,
              api.consts.xykLiquidityMining.nftCollectionId,
            ])
          const [omnipoolNftsRaw, miningNftsRaw, xykMiningNftsRaw] =
            await Promise.all([
              api.query.uniques.account.entries(address, omnipoolNftId),
              api.query.uniques.account.entries(address, miningNftId),
              api.query.uniques.account.entries(address, xykMiningNftId),
            ])

          const omnipoolNfts = omnipoolNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          const miningNfts = miningNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          const xykMiningNfts = xykMiningNftsRaw.map(([storageKey]) => {
            const [owner, classId, instanceId] = storageKey.args
            return {
              owner: owner.toString(),
              classId: classId.toString(),
              instanceId: instanceId.toString(),
            }
          })

          return { omnipoolNfts, miningNfts, xykMiningNfts }
        }
      : undefinedNoop,
    { enabled: !!address },
  )
}

export const useUserDeposits = (address?: string) => {
  const nftPositions = useAccountNFTPositions(address)

  const { miningNfts = [], xykMiningNfts = [] } = nftPositions.data ?? {}
  const omnipoolDeposits =
    useOmnipoolDeposits(
      miningNfts.map((miningNft) => miningNft.instanceId),
    ).data?.filter((deposit) => deposit.data) ?? []

  const xykDeposits =
    useXYKDeposits(
      xykMiningNfts.map((xykMiningNft) => xykMiningNft.instanceId),
    ).data?.filter((deposit) => deposit.data) ?? []

  return { omnipoolDeposits, xykDeposits }
}
