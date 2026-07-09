import { Balance as SdkBalance } from "@galacticcouncil/sdk-next"
import { useStableArray } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { produce } from "immer"
import { useCallback, useMemo } from "react"
import { pick } from "remeda"
import { create, StateCreator } from "zustand"
import { useShallow } from "zustand/react/shallow"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  useAccountOmnipoolMiningPositions,
  useAccountOmnipoolPositions,
  useAccountXykMiningPositions,
  XykDeposit,
} from "@/api/account"
import { AssetType, TBond, TErc20, TStableswap, TToken } from "@/api/assets"
import { AssetId, useAssets } from "@/providers/assetsProvider"

import { useAssetsPrice } from "./displayAsset"
import { OmnipoolPositionData, useOmnipoolPositionData } from "./liquidity"

export type Balance = SdkBalance & {
  assetId: string
}

export type Positions = {
  omnipool: OmnipoolPosition[]
  omnipoolMining: OmnipoolDepositFull[]
  xykMining: XykDeposit[]
}

export type XYKDepositPrice = XykDeposit & {
  price: string | undefined
}

export type DepositPosition =
  | XykDeposit
  | OmnipoolDepositFull
  | OmnipoolDepositFullWithData

export const isDepositPosition = (
  position:
    | DepositPosition
    | OmnipoolPositionWithData
    | AccountOmnipoolPosition,
): position is DepositPosition => "yield_farm_entries" in position

export const isXykDepositPosition = (
  position: DepositPosition,
): position is XykDeposit => "amm_pool_id" in position

export const isOmnipoolDepositPosition = (
  position: OmnipoolPosition | OmnipoolDepositFull,
): position is OmnipoolDepositFull => "yield_farm_entries" in position

export const isOmnipoolDepositFullPosition = (
  position: AccountOmnipoolPosition,
): position is OmnipoolDepositFullWithData => "yield_farm_entries" in position

export type OmnipoolPositionWithData = OmnipoolPosition & {
  data: OmnipoolPositionData
}

export type OmnipoolDepositFullWithData = OmnipoolDepositFull & {
  data: OmnipoolPositionData
}

export type AccountOmnipoolPosition =
  | OmnipoolPositionWithData
  | OmnipoolDepositFullWithData

type AccountOmnipoolPositions = {
  omnipool: OmnipoolPositionWithData[]
  omnipoolMining: OmnipoolDepositFullWithData[]
  all: AccountOmnipoolPosition[]
}

type BalanceRecord = Record<string, Balance>

type BalanceStorageSlice = {
  balances: BalanceRecord
  isBalanceLoading: boolean
  setBalance: (balances: Balance[]) => void
  resetBalances: () => void
  balancesLoaded: () => void
}

const createAccountsBalances: StateCreator<
  BalanceStorageSlice,
  [],
  [],
  BalanceStorageSlice
> = (set, _get, store) => ({
  balances: {},
  isBalanceLoading: true,
  setBalance: (balances) =>
    set((state) =>
      produce(state, (draft) => {
        balances.forEach((balance) => {
          if (balance.total > 0n) {
            draft.balances[balance.assetId] = balance
          } else {
            delete draft.balances[balance.assetId]
          }
        })
      }),
    ),
  resetBalances: () => set(store.getInitialState()),
  balancesLoaded: () => set({ isBalanceLoading: false }),
})

export const useAccountData = create<BalanceStorageSlice>((...a) => ({
  ...createAccountsBalances(...a),
}))

export const useAccountBalances = () => {
  const { account } = useAccount()
  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )

  const getBalance = useCallback(
    (assetId: AssetId) => balances[assetId.toString()],
    [balances],
  )

  const getTransferableBalance = useCallback(
    (assetId: string) => balances[assetId]?.transferable ?? 0n,
    [balances],
  )

  const isBalanceLoaded = useCallback(
    (id: string) => id in balances,
    [balances],
  )

  return {
    balances,
    isBalanceLoading: account ? isBalanceLoading : false,
    getBalance,
    getTransferableBalance,
    isBalanceLoaded,
  }
}

export const useAccountBalance = (assetId: AssetId): Balance | undefined => {
  const { balances } = useAccountBalances()
  return balances[assetId.toString()]
}

export const useAccountPositions = () => {
  const { data: omnipool = [], isLoading: isOmnipoolLoading } =
    useAccountOmnipoolPositions()
  const { data: omnipoolMining = [], isLoading: isOmnipoolMiningLoading } =
    useAccountOmnipoolMiningPositions()
  const { data: xykMining = [], isLoading: isXykMiningLoading } =
    useAccountXykMiningPositions()

  const isLoading =
    isOmnipoolLoading || isOmnipoolMiningLoading || isXykMiningLoading

  const isPositions =
    omnipool.length > 0 || omnipoolMining.length > 0 || xykMining.length > 0

  const positions = {
    omnipool,
    omnipoolMining,
    xykMining,
  }

  const positionsAmount =
    omnipool.length + omnipoolMining.length + xykMining.length

  const getPositions = useCallback(
    (id: string) => {
      const omnipoolPositions = omnipool.filter(
        (position) => position.assetId === id,
      )
      const omnipoolMiningPositions = omnipoolMining.filter(
        (position) => position.assetId === id,
      )
      const xykMiningPositions = xykMining.filter(
        (position) => position.amm_pool_id === id,
      )

      return { omnipoolPositions, omnipoolMiningPositions, xykMiningPositions }
    },

    [omnipool, omnipoolMining, xykMining],
  )

  return {
    positions,
    positionsAmount,
    isPositions,
    isLoading,
    getPositions,
  }
}

export const useAccountOmnipoolPositionsData = () => {
  const {
    data: omnipoolPositions = [],
    isLoading: isOmnipoolPositionsLoading,
  } = useAccountOmnipoolPositions()
  const {
    data: omnipoolMiningPositions = [],
    isLoading: isOmnipoolMiningPositionsLoading,
  } = useAccountOmnipoolMiningPositions()

  const isPositions =
    omnipoolPositions.length > 0 || omnipoolMiningPositions.length > 0

  const { isLoading: isPositionDataLoading, getData } =
    useOmnipoolPositionData(isPositions)

  const isLoading =
    isOmnipoolPositionsLoading ||
    isOmnipoolMiningPositionsLoading ||
    isPositionDataLoading

  const data = useMemo((): AccountOmnipoolPositions | undefined => {
    if (isLoading) return undefined

    const omnipool: OmnipoolPositionWithData[] = []
    const omnipoolMining: OmnipoolDepositFullWithData[] = []

    for (const position of omnipoolPositions) {
      const data = getData(position)

      if (data) {
        omnipool.push({ ...position, data })
      }
    }

    for (const position of omnipoolMiningPositions) {
      const data = getData(position)

      if (data) {
        omnipoolMining.push({ ...position, data })
      }
    }

    return {
      omnipool,
      omnipoolMining,
      all: [...omnipool, ...omnipoolMining],
    }
  }, [getData, isLoading, omnipoolPositions, omnipoolMiningPositions])

  const getAssetPositions = useCallback(
    (id: string): AccountOmnipoolPositions => {
      const omnipool =
        data?.omnipool.filter((position) => position.assetId === id) ?? []
      const omnipoolMining =
        data?.omnipoolMining.filter((position) => position.assetId === id) ?? []

      return { omnipool, omnipoolMining, all: [...omnipool, ...omnipoolMining] }
    },

    [data],
  )

  return { data, isLoading, getAssetPositions }
}

export const useAccountBalancesWithPriceByAssetType = (
  assetTypes: Array<
    Exclude<AssetType, AssetType.External | AssetType.Unknown | AssetType.XYK>
  >,
) => {
  const stableAssetTypes = useStableArray(assetTypes)
  const { getAsset, isToken, isStableSwap, isErc20, isBond } = useAssets()
  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )

  const {
    tokenBalances,
    erc20Balances,
    stableSwapBalances,
    bondBalances,
    priceIds,
  } = useMemo(() => {
    const tokenBalances: Array<{ balance: Balance; meta: TToken }> = []
    const erc20Balances: Array<{ balance: Balance; meta: TErc20 }> = []
    const stableSwapBalances: Array<{ balance: Balance; meta: TStableswap }> =
      []
    const bondBalances: Array<{ balance: Balance; meta: TBond }> = []
    const priceIds: Array<string> = []

    if (isBalanceLoading) {
      return {
        tokenBalances,
        erc20Balances,
        stableSwapBalances,
        bondBalances,
        priceIds,
      }
    }

    for (const balance of Object.values(balances)) {
      const asset = getAsset(balance.assetId)
      if (!asset) continue

      const isTokenType = isToken(asset)
      const isErc20Type = isErc20(asset)
      const isStableSwapType = isStableSwap(asset)
      const isBondType = isBond(asset)

      const isSupportedType =
        isTokenType || isErc20Type || isStableSwapType || isBondType
      const isValidType = isSupportedType
        ? stableAssetTypes.includes(asset.type)
        : false

      if (!isValidType) continue

      priceIds.push(isBondType ? asset.underlyingAssetId : balance.assetId)

      if (isTokenType) {
        tokenBalances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isStableSwapType) {
        stableSwapBalances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isErc20Type) {
        erc20Balances.push({
          balance: balance,
          meta: asset,
        })
      } else if (isBondType) {
        bondBalances.push({
          balance: balance,
          meta: asset,
        })
      }
    }

    return {
      tokenBalances,
      erc20Balances,
      stableSwapBalances,
      bondBalances,
      priceIds,
    }
  }, [
    balances,
    getAsset,
    isToken,
    isErc20,
    isStableSwap,
    isBond,
    stableAssetTypes,
    isBalanceLoading,
  ])

  const { getAssetPrice, isLoading: isAssetPriceLoading } =
    useAssetsPrice(priceIds)

  const mapBalancesWithPrice = useCallback(
    <T extends { meta: { id: string } }>(
      balances: T[],
      getPriceAssetId: (meta: T["meta"]) => string = (meta) => meta.id,
    ): Array<T & { price: string | undefined }> => {
      return balances.map((balance) => {
        const assetPrice = getAssetPrice(getPriceAssetId(balance.meta))
        return {
          ...balance,
          price: assetPrice.isValid ? assetPrice.price : undefined,
        }
      })
    },
    [getAssetPrice],
  )

  const data = useMemo(() => {
    if (isAssetPriceLoading) return

    return {
      tokenBalances: mapBalancesWithPrice(tokenBalances),
      erc20Balances: mapBalancesWithPrice(erc20Balances),
      stableSwapBalances: mapBalancesWithPrice(stableSwapBalances),
      bondBalances: mapBalancesWithPrice(
        bondBalances,
        (meta) => (meta as TBond).underlyingAssetId,
      ),
    }
  }, [
    bondBalances,
    erc20Balances,
    mapBalancesWithPrice,
    isAssetPriceLoading,
    stableSwapBalances,
    tokenBalances,
  ])

  return { data, isLoading: isAssetPriceLoading || isBalanceLoading }
}
