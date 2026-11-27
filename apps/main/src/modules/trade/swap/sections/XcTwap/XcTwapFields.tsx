import { Box, Separator, Stack } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcChainAssetSelect } from "@/modules/trade/swap/sections/XcSwap/components/XcChainAssetSelect"
import { XcSrcAssetSelectField } from "@/modules/trade/swap/sections/XcSwap/components/XcSrcAssetSelectField"
import { XcSwapRecipientButton } from "@/modules/trade/swap/sections/XcSwap/components/XcSwapRecipientButton"
import { getXcAssetId } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/types"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useXcTwap } from "@/modules/trade/swap/sections/XcTwap/XcTwapProvider"
import { XcTwapSwitcher } from "@/modules/trade/swap/sections/XcTwap/XcTwapSwitcher"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

export const XcTwapFields: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const navigate = useNavigate()
  const { watch, getValues, setValue } = useFormContext<XcTwapFormValues>()
  const { destChainAssetPairs, srcChainLogo, isSelectionLoading, maxBalance } =
    useXcTwap()
  const { tradable } = useAssets()

  const sellableAssets = useMemo(
    () => tradable.filter((asset) => asset.id !== NATIVE_EVM_ASSET_ID),
    [tradable],
  )

  const [destChain, buyAsset] = watch(["destChain", "buyAsset"])

  // assetIn drives the max balance (useMaxOrderBalance reads it)
  const handleSellAssetChange = (sellAsset: TAsset) => {
    setValue("sellAmount", "")

    navigate({
      to: ".",
      search: (search) => ({ ...search, assetIn: sellAsset.id }),
      resetScroll: false,
    })
  }

  // A Hydration asset navigates back to on-chain DCA (TwapTab); a destination
  // updates the form through XcTwapProvider's URL sync.
  const handleDestSelectionChange = (selection: XcChainAssetPair) => {
    const { sellAsset, destChain: previousChain } = getValues()

    if (selection.chain.key !== previousChain?.key) {
      setValue("sellAmount", "")
      setValue("destAddress", "")
    }

    navigate({
      to: ".",
      search: (search) => ({
        ...search,
        assetIn: sellAsset?.id ?? search.assetIn,
        assetOut: getXcAssetId(selection.asset) ?? search.assetOut,
        destPlatform: selection.chain.platform,
      }),
      resetScroll: false,
    })
  }

  return (
    <Stack>
      <Box py="l" width="100%">
        <XcSrcAssetSelectField
          label={t("trade:dca.assetIn.title")}
          assets={sellableAssets}
          sideChainSrc={srcChainLogo}
          collapsed
          maxBalance={maxBalance}
          onAssetChange={handleSellAssetChange}
        />
      </Box>
      <XcTwapSwitcher />
      <Box py="l" width="100%">
        <XcChainAssetSelect
          label={t("buy")}
          chainAssetPairs={destChainAssetPairs}
          selectedChain={destChain}
          selectedAsset={buyAsset}
          modalTitle={t("trade:xc.swap.field.destTitle")}
          showSideChain
          isAmountHidden
          isLoading={isSelectionLoading}
          onSelectionChange={handleDestSelectionChange}
        />
      </Box>
      {destChain && (
        <>
          <Separator mx="-xl" />
          <XcSwapRecipientButton key={destChain.key} destChain={destChain} />
        </>
      )}
    </Stack>
  )
}
