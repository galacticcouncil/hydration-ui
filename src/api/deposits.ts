import { ApiPromise } from "@polkadot/api"
import { u128, Option, StorageKey, Null } from "@polkadot/types"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import {
  PalletLiquidityMiningDepositData,
  PalletOmnipoolPosition,
} from "@polkadot/types/lookup"
import { undefinedNoop } from "utils/helpers"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { TBalance } from "./balances"
import { TAsset } from "providers/assets"
import { millisecondsInMinute } from "date-fns/constants"
import { create } from "zustand"
import { useUniqueIds } from "./consts"
import { useEffect } from "react"

import { useAccountBalance } from "./accountBalances"

export type TYieldFarmEntry = {
  globalFarmId: string
  yieldFarmId: string
  enteredAt: string
  updatedAt: string
  accumulatedRpvs: string
  valuedShares: string
  accumulatedClaimedRewards: string
  stoppedAtCreation: string
}

type TDepositData = {
  shares: string
  ammPoolId: string
  yieldFarmEntries: Array<TYieldFarmEntry>
}

export type TDeposit = {
  id: string
  data: TDepositData
  isXyk: boolean
}

export type TOmnipoolPosition = {
  id: string
  assetId: string
  amount: string
  shares: string
  price: string[]
}

export type TAccountPositions = {
  isPoolPositions: boolean
  xykDeposits?: TDeposit[]
  omnipoolDeposits?: TDeposit[]
  liquidityPositions?: TOmnipoolPosition[]
  depositLiquidityPositions?: (TOmnipoolPosition & {
    depositId: string
  })[]
}

export type TAccountAsset = {
  balance?: TBalance
  asset: TAsset
  isPoolPositions: boolean
}

export const useRefetchAccountAssets = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  return () => {
    queryClient.refetchQueries(QUERY_KEYS.accountPositions(account?.address))
  }
}

const parseNfts = (
  nfts: [StorageKey<[AccountId32, u128, u128]>, Option<Null>][],
) =>
  nfts.map(([storageKey]) => {
    const [owner, classId, instanceId] = storageKey.args

    return {
      owner: owner.toString(),
      classId: classId.toString(),
      instanceId: instanceId.toString(),
    }
  })

const parceLiquidityPositions = <T>(
  positions: Option<PalletOmnipoolPosition>[],
  ids: string[],
  metadata?: T[],
) =>
  positions.reduce<
    Array<
      {
        id: string
        assetId: string
        amount: string
        shares: string
        price: string[]
      } & T
    >
  >((acc, pos, i) => {
    if (!pos.isNone) {
      const data = pos.unwrap()

      acc.push({
        id: ids[i],
        amount: data.amount.toString(),
        shares: data.shares.toString(),
        price: data.price.map((e) => e.toString()),
        assetId: data.assetId.toString(),
        ...(metadata ? metadata[i] : ({} as T)),
      })
    }

    return acc
  }, [])

const parseDepositData = (
  api: ApiPromise,
  nfts: {
    owner: string
    classId: string
    instanceId: string
  }[],
  values: Option<PalletLiquidityMiningDepositData>[],
  isXyk: boolean,
) => {
  return nfts
    .reduce<
      {
        id: string
        data: TDepositData
        isXyk: boolean
      }[]
    >((acc, nft, index) => {
      const dataRaw = values[index]

      if (!dataRaw.isNone) {
        const dataUnwraped = api.registry.createType(
          isXyk ? "XykLMDeposit" : "OmnipoolLMDeposit",
          dataRaw.unwrap(),
        ) as PalletLiquidityMiningDepositData
        const data: TDepositData = {
          ammPoolId: dataUnwraped.ammPoolId.toString(),
          shares: dataUnwraped.shares.toString(),
          yieldFarmEntries: dataUnwraped.yieldFarmEntries.map((farmEntry) => ({
            globalFarmId: farmEntry.globalFarmId.toString(),
            yieldFarmId: farmEntry.yieldFarmId.toString(),
            enteredAt: farmEntry.enteredAt.toString(),
            updatedAt: farmEntry.updatedAt.toString(),
            valuedShares: farmEntry.valuedShares.toString(),
            accumulatedRpvs: farmEntry.accumulatedRpvs.toString(),
            accumulatedClaimedRewards:
              farmEntry.accumulatedClaimedRewards.toString(),
            stoppedAtCreation: farmEntry.stoppedAtCreation.toString(),
          })),
        }
        acc.push({
          id: nft.instanceId,
          data,
          isXyk,
        })
      }

      return acc
    }, [])
    .sort((a, b) => {
      const firstFarmLastBlock = a.data.yieldFarmEntries.reduce(
        (acc, curr) => (acc.lt(curr.enteredAt) ? BN(curr.enteredAt) : acc),
        BN_0,
      )

      const secondFarmLastBlock = b.data.yieldFarmEntries.reduce(
        (acc, curr) => (acc.lt(curr.enteredAt) ? BN(curr.enteredAt) : acc),
        BN_0,
      )

      return secondFarmLastBlock.minus(firstFarmLastBlock).toNumber()
    })
}

export const useAccountPositions = (givenAddress?: string) => {
  const { account } = useAccount()
  const { api, isLoaded } = useRpcProvider()
  const { data: uniqueIds } = useUniqueIds()

  const address = givenAddress ?? account?.address

  const { data, isLoading, isInitialLoading, isSuccess } = useQuery(
    QUERY_KEYS.accountPositions(address),
    address != null && uniqueIds
      ? async () => {
          const { omnipoolNftId, miningNftId, xykMiningNftId } = uniqueIds
          const [omnipoolNftsRaw, miningNftsRaw, xykMiningNftsRaw] =
            await Promise.all([
              api.query.uniques.account.entries(address, omnipoolNftId),
              api.query.uniques.account.entries(address, miningNftId),
              api.query.uniques.account.entries(address, xykMiningNftId),
            ])

          const omnipoolNfts = parseNfts(omnipoolNftsRaw)
          const miningNfts = parseNfts(miningNftsRaw)
          const xykMiningNfts = parseNfts(xykMiningNftsRaw)

          const liquidityPositionIds = omnipoolNfts.map((nft) => nft.instanceId)
          const omnipoolKeys = miningNfts.map((nft) =>
            api.query.omnipoolWarehouseLM.deposit.key(nft.instanceId),
          )
          const xykKeys = xykMiningNfts.map((nft) =>
            api.query.xykWarehouseLM.deposit.key(nft.instanceId),
          )

          const omniPositionIdsRaw = await Promise.all(
            miningNfts.map((pos) =>
              api.query.omnipoolLiquidityMining.omniPositionId(pos.instanceId),
            ),
          )

          const [
            liquidityPos,
            // omniPositionIdsRaw,
            omnipoolData = [],
            xykData = [],
          ] = await Promise.all([
            api.query.omnipool.positions.multi(liquidityPositionIds),
            // api.query.omnipoolLiquidityMining.omniPositionId.multi(
            //   miningNfts.map((nft) => nft.instanceId),
            // ),
            omnipoolKeys.length
              ? (api.rpc.state.queryStorageAt(omnipoolKeys) as Promise<
                  Option<PalletLiquidityMiningDepositData>[]
                >)
              : [],
            xykKeys.length
              ? (api.rpc.state.queryStorageAt(xykKeys) as Promise<
                  Option<PalletLiquidityMiningDepositData>[]
                >)
              : undefined,
          ])

          const omniPositionIds = omniPositionIdsRaw.map((id) => id.toString())

          const depositLiquidityPositions = parceLiquidityPositions(
            await api.query.omnipool.positions.multi(omniPositionIds),
            omniPositionIds,
            miningNfts.map((nft) => ({ depositId: nft.instanceId })),
          )

          const liquidityPositions = parceLiquidityPositions(
            liquidityPos,
            liquidityPositionIds,
          )

          const omnipoolDeposits = parseDepositData(
            api,
            miningNfts,
            omnipoolData,
            false,
          )

          const xykDeposits = parseDepositData(
            api,
            xykMiningNfts,
            xykData,
            true,
          )

          const accountAssetsMap: Map<string, TAccountPositions> = new Map([])

          xykDeposits.forEach((deposit) => {
            const id = deposit.data.ammPoolId
            const balance = accountAssetsMap.get(id)

            accountAssetsMap.set(id, {
              ...(balance ?? {}),
              xykDeposits: [...(balance?.xykDeposits ?? []), deposit],
              isPoolPositions: true,
            })
          })

          omnipoolDeposits.forEach((omnipoolDeposit) => {
            const id = omnipoolDeposit.data.ammPoolId

            const balance = accountAssetsMap.get(id)

            accountAssetsMap.set(id, {
              ...(balance ?? {}),

              omnipoolDeposits: [
                ...(balance?.omnipoolDeposits ?? []),
                omnipoolDeposit,
              ],
              isPoolPositions: true,
            })
          })

          liquidityPositions.forEach((liquidityPosition) => {
            const id = liquidityPosition.assetId

            const balance = accountAssetsMap.get(id)

            accountAssetsMap.set(id, {
              ...(balance ?? {}),

              liquidityPositions: [
                ...(balance?.liquidityPositions ?? []),
                liquidityPosition,
              ],
              isPoolPositions: true,
            })
          })

          depositLiquidityPositions.forEach((depositLiquidityPosition) => {
            const id = depositLiquidityPosition.assetId

            const balance = accountAssetsMap.get(id)

            accountAssetsMap.set(id, {
              ...(balance ?? {}),

              depositLiquidityPositions: [
                ...(balance?.depositLiquidityPositions ?? []),
                depositLiquidityPosition,
              ],
              isPoolPositions: true,
            })
          })

          const isAnyPositions =
            !!xykDeposits.length ||
            !!omnipoolDeposits.length ||
            !!liquidityPositions.length

          return {
            liquidityPositions,
            depositLiquidityPositions,
            omnipoolDeposits,
            xykDeposits,
            accountAssetsMap,
            accountAddress: address,
            isAnyPositions,
          }
        }
      : undefinedNoop,
    {
      enabled: !!address && isLoaded && !!uniqueIds,
      staleTime: millisecondsInMinute,
    },
  )

  useEffect(() => {
    if (data?.isAnyPositions) {
      setIsAccountPositions(data.isAnyPositions)
    }
  }, [data?.isAnyPositions])

  return { data, isLoading, isInitialLoading, isSuccess }
}

type TAccountBalance = {
  isBalance: boolean
}

type TAccountPosiitons = {
  isPositions: boolean
}

export const useIsAccountBalance = create<TAccountBalance>(() => ({
  isBalance: false,
}))

export const useIsAccountPositions = create<TAccountPosiitons>(() => ({
  isPositions: false,
}))

export const useXykVolumeTotal = create<{ volume?: string }>(() => ({
  volume: undefined,
}))

const setIsAccountPositions = (isPositions: boolean) =>
  useIsAccountPositions.setState((state) => {
    if (state.isPositions !== isPositions) {
      return { isPositions }
    }

    return { isPositions: state.isPositions }
  })

export const setIsAccountBalance = (isBalance: boolean) =>
  useIsAccountBalance.setState((state) => {
    if (state.isBalance !== isBalance) {
      return { isBalance }
    }

    return { isBalance: state.isBalance }
  })

export type AccountBalance = {
  balance: TBalance
  asset: TAsset
}

type AccountBalancesStore = {
  data:
    | {
        accountAssetsMap: Map<
          string,
          AccountBalance & { isPoolPositions: boolean }
        >
        balances: AccountBalance[]
        isBalance: boolean
      }
    | undefined
  isLoading: boolean
  isInitialLoading: boolean
  isSuccess: boolean
}

export const useAccountBalances = (givenAddress?: string) => {
  const { account } = useAccount()
  const address = givenAddress ?? account?.address ?? ""
  const isConnectedAccount = account?.address === address

  const connectedAccountBalances = useAccountBalancesStore()

  const { data, isSuccess, isLoading, isInitialLoading } = useAccountBalance(
    !isConnectedAccount ? address : undefined,
  )

  if (isConnectedAccount) return connectedAccountBalances

  return { data, isSuccess, isLoading, isInitialLoading }
}

export const useAccountBalancesStore = create<AccountBalancesStore>(() => ({
  data: undefined,
  isLoading: false,
  isInitialLoading: false,
  isSuccess: false,
}))

export const setAccountBalances = (store: AccountBalancesStore) =>
  useAccountBalancesStore.setState({ ...store })
