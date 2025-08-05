import {
  is_add_liquidity_allowed,
  is_buy_allowed,
  is_remove_liquidity_allowed,
  is_sell_allowed,
} from "@galacticcouncil/math-omnipool"
import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { prop } from "remeda"
import { create } from "zustand"
import { useShallow } from "zustand/shallow"

import { OmnipoolDepositFull, OmnipoolPosition } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { OmniPoolToken, omnipoolTokens } from "@/api/pools"
import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import { useAssets } from "@/providers/assetsProvider"
import { scale, scaleHuman } from "@/utils/formatting"

import { useAssetsPrice } from "./displayAsset"

export const getTradabilityFromBits = (bits: number) => ({
  canBuy: is_buy_allowed(bits),
  canSell: is_sell_allowed(bits),
  canAddLiquidity: is_add_liquidity_allowed(bits),
  canRemoveLiquidity: is_remove_liquidity_allowed(bits),
})

export const useOmnipoolIds = create<{ ids?: string[] }>(() => ({
  ids: undefined,
}))

export const setOmnipoolIds = (ids: string[]) =>
  useOmnipoolIds.setState({ ids })

type LiquidityOutParams = Parameters<typeof calculate_liquidity_out>

type LiquidityOutOptions = {
  sharesValue?: string
  fee?: string
}

export const calculateLiquidityOut = (args: LiquidityOutParams) => {
  const liquidity = calculate_liquidity_out.apply(this, args)
  const hubLiquidity = calculate_liquidity_lrna_out.apply(this, args)

  return { liquidity, hubLiquidity }
}

export const getLiquidityOutParams = (
  omnipoolData: OmniPoolToken,
  position: OmnipoolPosition | OmnipoolDepositFull,
  options?: LiquidityOutOptions,
): LiquidityOutParams => {
  const [nom, denom] = position.price.map((n) => n.toString()) as [
    string,
    string,
  ]
  const price = Big(nom).div(denom).toString()

  return [
    omnipoolData.balance.toString(),
    omnipoolData.hubReserves.toString(),
    omnipoolData.shares.toString(),
    position.amount.toString(),
    position.shares.toString(),
    Big(scale(price, "q")).toFixed(0),
    options?.sharesValue ?? position.shares.toString(),
    options?.fee ?? "0",
  ]
}

export type OmnipoolPositionData = {
  currentValue: string
  currentValueHuman: string
  currentDisplay: string

  currentHubValue: string
  currentHubValueHuman: string
  currentHubDisplay: string

  currentTotalValue: string
  currentTotalValueHuman: string
  currentTotalDisplay: string

  initialValue: string
  initialValueHuman: string
  initialDisplay: string

  meta: TAssetData
}

export const useOmnipoolPositionData = (
  enabled: boolean | undefined = true,
) => {
  const { hub, getAssetWithFallback } = useAssets()

  const { data: omnipoolTokensData = [], isLoading: isOmnipoolTokensLoading } =
    useQuery({ ...omnipoolTokens, enabled })
  const { ids } = useOmnipoolIds()

  const { isLoading: isPriceLoading, getAssetPrice } = useAssetsPrice(
    enabled && ids ? [...ids, hub.id] : [],
  )

  const isLoading = isPriceLoading || isOmnipoolTokensLoading

  const getData = useCallback(
    (
      position: OmnipoolPosition | OmnipoolDepositFull,
      options?: LiquidityOutOptions,
    ): OmnipoolPositionData | undefined => {
      const price = getAssetPrice(position.assetId).price
      const meta = getAssetWithFallback(position.assetId)
      const omnipoolData = omnipoolTokensData.find(
        (omnipoolTokenData) =>
          omnipoolTokenData.id.toString() === position.assetId,
      )

      if (omnipoolData && price) {
        const { liquidity, hubLiquidity } = calculateLiquidityOut(
          getLiquidityOutParams(omnipoolData, position, options),
        )

        const initialValue = position.amount.toString()
        const initialValueHuman = scaleHuman(initialValue, meta.decimals)
        const initialDisplay = Big(initialValueHuman).times(price).toString()

        const currentValue = liquidity
        const currentValueHuman = scaleHuman(currentValue, meta.decimals)
        const currentDisplay = Big(currentValueHuman).times(price).toString()

        let currentHubValue = "0"
        let currentHubValueHuman = "0"
        let currentHubDisplay = "0"

        // total value (with hub amount) displayed in position asset
        let currentTotalValue = currentValue
        let currentTotalValueHuman = currentValueHuman
        let currentTotalDisplay = currentDisplay

        if (Big(hubLiquidity).gt(0)) {
          const hubPrice = getAssetPrice(hub.id).price

          currentHubValue = hubLiquidity
          currentHubValueHuman = scaleHuman(currentHubValue, hub.decimals)

          currentHubDisplay = Big(currentHubValueHuman)
            .times(hubPrice)
            .toString()

          currentTotalDisplay = Big(currentTotalDisplay)
            .plus(currentHubDisplay)
            .toString()

          currentTotalValueHuman = Big(currentTotalDisplay)
            .div(price)
            .toString()
          currentTotalValue = Big(
            scale(currentTotalValueHuman, meta.decimals),
          ).toFixed(0)
        }

        return {
          currentValue,
          currentValueHuman,
          currentDisplay,

          currentHubValue,
          currentHubValueHuman,
          currentHubDisplay,

          currentTotalValue,
          currentTotalValueHuman,
          currentTotalDisplay,

          initialValue,
          initialValueHuman,
          initialDisplay,

          meta,
        }
      }
    },
    [getAssetPrice, getAssetWithFallback, hub, omnipoolTokensData],
  )

  return { getData, isLoading }
}

type OmnipoolAssetsStore = {
  data: OmnipoolAssetTable[] | undefined
  isLoading: boolean
}

export const useOmnipoolAssetsStore = create<OmnipoolAssetsStore>(() => ({
  data: undefined,
  isLoading: true,
}))

export const setOmnipoolAssets = (
  data: OmnipoolAssetTable[],
  isLoading: boolean,
) => useOmnipoolAssetsStore.setState({ data, isLoading })

export const useOmnipoolStablepoolAssets = () => {
  useQuery({
    queryKey: ["omnipoolAssets"],
    queryFn: () => {
      throw new Error("queryFn should not run")
    },
  })
  const store = useOmnipoolAssetsStore()

  const getOmnipoolAsset = useCallback(
    (assetId: string) => store.data?.find((asset) => asset.id === assetId),
    [store.data],
  )

  return { ...store, getOmnipoolAsset }
}

export const useOmnipoolAsset = (assetId: string) => {
  useQuery({
    queryKey: ["omnipoolAssets"],
    staleTime: Infinity,
    queryFn: () => {
      throw new Error("queryFn should not run")
    },
  })

  const isLoading = useOmnipoolAssetsStore(prop("isLoading"))
  const data = useOmnipoolAssetsStore(
    useShallow((state) => state.data?.find((asset) => asset.id === assetId)),
  )

  return { isLoading, data }
}

type XYKPoolsStore = {
  data?: IsolatedPoolTable[]
  validAddresses?: string[]
  isLoading?: boolean
}

export const useXYKPoolsStore = create<XYKPoolsStore>(() => ({
  data: undefined,
  validAddresses: undefined,
  isLoading: true,
}))

export const setXYKPools = (data: XYKPoolsStore) =>
  useXYKPoolsStore.setState((prevState) => ({ ...prevState, ...data }))

export const useXYKPools = () => {
  useQuery({
    queryKey: ["xykLiquidityPools"],
    queryFn: () => {
      throw new Error("queryFn should not run")
    },
  })
  const store = useXYKPoolsStore()

  const getXYKPool = useCallback(
    (address: string) => store.data?.find((pool) => pool.id === address),
    [store.data],
  )

  return { ...store, getXYKPool }
}

export const useXYKPool = (address: string) => {
  useQuery({
    queryKey: ["xykLiquidityPools"],
    queryFn: () => {
      throw new Error("queryFn should not run")
    },
  })

  const isLoading = useXYKPoolsStore(prop("isLoading"))
  const data = useXYKPoolsStore(
    useShallow((state) => state.data?.find((pool) => pool.id === address)),
  )

  return { isLoading, data }
}
