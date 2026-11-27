import { HYDRATION_CHAIN_KEY, isH160Address } from "@galacticcouncil/utils"
import { useAccount, WalletMode } from "@galacticcouncil/web3-connect"
import { TwapParams, XcIntentsTrade } from "@galacticcouncil/xc-intents"
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { FormProvider } from "react-hook-form"
import { getAddress } from "viem"

import { useMaxOrderBalance } from "@/modules/trade/swap/sections/DCA/useMaxOrderBalance"
import { isAccountCompatibleWithWalletMode } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapRequiredWalletMode"
import {
  findXcChainAssetPair,
  isSameXcAsset,
} from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/types"
import { useXcTwapAssetPairs } from "@/modules/trade/swap/sections/XcTwap/hooks/useXcTwapAssetPairs"
import { useXcTwapEstimate } from "@/modules/trade/swap/sections/XcTwap/hooks/useXcTwapEstimate"
import {
  getXcTwapErrorView,
  XC_TWAP_NO_ERRORS,
  XcTwapErrorView,
} from "@/modules/trade/swap/sections/XcTwap/utils/errors"
import { useXcTwapForm } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useAssets } from "@/providers/assetsProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"
import { XcPlatform } from "@/utils/trade"

type XcTwapContextValue = {
  readonly destChainAssetPairs: XcChainAssetPair[]
  /** The sold asset's chain; a TWAP always sells on Hydration */
  readonly srcChainLogo: string
  readonly isSelectionLoading: boolean
  readonly maxBalance: string
  readonly refundTo: string | null
  readonly isWalletCompatible: boolean
  readonly estimate: XcIntentsTrade | undefined
  /** What the estimate was asked with; null until the inputs are valid */
  readonly estimateParams: TwapParams | null
  readonly isEstimateLoading: boolean
  readonly estimateError: Error | null
  readonly estimateAlert: XcTwapErrorView["alert"]
  /** Order count the estimate uses; null until it's known */
  readonly tranches: number | null
  /** 0 where the destination has no payout batching (NEAR) */
  readonly routeMin: bigint
  /** Payouts minDelivery leads to; 0 until it's known */
  readonly payouts: number
}

const XcTwapContext = createContext<XcTwapContextValue>({
  destChainAssetPairs: [],
  srcChainLogo: "",
  isSelectionLoading: true,
  maxBalance: "0",
  refundTo: null,
  isWalletCompatible: true,
  estimate: undefined,
  estimateParams: null,
  isEstimateLoading: false,
  estimateError: null,
  estimateAlert: null,
  tranches: null,
  routeMin: 0n,
  payouts: 0,
})

export const useXcTwap = () => useContext(XcTwapContext)

type XcTwapProviderProps = {
  readonly children: ReactNode
  readonly assetIn: string
  readonly assetOut: string
  readonly destPlatform: XcPlatform
}

export const XcTwapProvider: FC<XcTwapProviderProps> = ({
  children,
  assetIn,
  assetOut,
  destPlatform,
}) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const {
    chainAssetPairs: destChainAssetPairs,
    hydrationChain,
    isDestinationsLoading,
  } = useXcTwapAssetPairs()

  // Every order sells into WETH before it's bridged
  const { limitOrderMaxBalance: maxBalance } = useMaxOrderBalance({
    assetIn,
    assetOut: NATIVE_EVM_ASSET_ID,
  })

  const refundTo = isH160Address(account?.rawAddress)
    ? getAddress(account.rawAddress)
    : null

  // The estimate's leastIn bounds the order count, which feeds the estimate
  const [leastIn, setLeastIn] = useState<bigint | null>(null)
  // The estimate's errors land on form fields
  const [errorView, setErrorView] = useState(XC_TWAP_NO_ERRORS)

  const form = useXcTwapForm({
    sellAsset: getAsset(assetIn) ?? null,
    maxBalance,
    leastIn,
    errorView,
  })
  const { getValues, setValue, watch } = form

  const {
    estimate,
    params: estimateParams,
    leastIn: estimateLeastIn,
    isLoading: isEstimateLoading,
    error: estimateError,
    tranches,
    routeMin,
    payouts,
  } = useXcTwapEstimate({ form, refundTo, leastIn })

  useEffect(() => setLeastIn(estimateLeastIn), [estimateLeastIn])

  // A stale estimate's errors belong to other inputs, so hide them meanwhile
  const nextErrorView = useMemo(
    () =>
      isEstimateLoading
        ? XC_TWAP_NO_ERRORS
        : getXcTwapErrorView(estimate?.errors ?? [], !!estimateError),
    [estimate, estimateError, isEstimateLoading],
  )

  useEffect(() => setErrorView(nextErrorView), [nextErrorView])

  useEffect(() => {
    // An assetOut that isn't a TWAP destination (e.g. from a pasted URL) falls
    // back to the platform's TWAP destination
    const pair =
      findXcChainAssetPair(destChainAssetPairs, assetOut, destPlatform) ??
      (destPlatform !== HYDRATION_CHAIN_KEY
        ? destChainAssetPairs.find(({ chain }) => chain.key === destPlatform)
        : undefined)
    if (!pair) return

    const { destChain, buyAsset } = getValues()
    if (
      destChain?.key === pair.chain.key &&
      buyAsset &&
      isSameXcAsset(buyAsset, pair.asset)
    ) {
      return
    }

    setValue("destChain", pair.chain)
    setValue("buyAsset", pair.asset)
  }, [assetOut, destChainAssetPairs, destPlatform, getValues, setValue])

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  // A Intent TWAP is signed from an EVM account
  const isWalletCompatible =
    !account || isAccountCompatibleWithWalletMode(account, WalletMode.EVM)

  return (
    <XcTwapContext.Provider
      value={{
        destChainAssetPairs,
        srcChainLogo: hydrationChain.logo,
        isSelectionLoading: isDestinationsLoading || !sellAsset || !buyAsset,
        maxBalance,
        refundTo,
        isWalletCompatible,
        estimate,
        estimateParams,
        isEstimateLoading,
        estimateError,
        estimateAlert: nextErrorView.alert,
        tranches,
        routeMin,
        payouts,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </XcTwapContext.Provider>
  )
}
