import { Lock } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { USDC_ASSET_ID, USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetLogo } from "@/components/AssetLogo"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import { useStableBondsForm } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import {
  FAKE_STRATEGY,
  STABLE_BONDS_ASSET_ID,
} from "@/modules/strategies/stable-bonds/constants"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const TOTAL_FEES_USD = 5.63

export const StableBondsPanel = () => {
  const { t } = useTranslation("common")
  const rpc = useRpcProvider()
  const form = useStableBondsForm()
  const { getAssetWithFallback } = useAssets()

  const depositAssets = useMemo(() => {
    return [USDC_ASSET_ID, USDT_ASSET_ID].map((id) => getAssetWithFallback(id))
  }, [getAssetWithFallback])

  const receiveAsset = getAssetWithFallback(STABLE_BONDS_ASSET_ID)

  const { handleSubmit, watch } = form
  const [depositAsset, depositAmount] = watch(["depositAsset", "depositAmount"])

  const depositAssetId = depositAsset?.id ?? ""

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, depositAssetId, STABLE_BONDS_ASSET_ID),
  )

  const depositAmountNum = parseFloat(depositAmount) || 0
  const spotPrice = spotPriceData?.spotPrice
  const receiveAmount =
    spotPrice && depositAmountNum > 0
      ? Big(depositAmountNum).times(spotPrice).toString()
      : ""

  const onSubmit = (_values: StableBondsFormValues) => {
    // TODO: implement stable bonds deposit transaction
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Paper px="xl">
          <Box>
            <AssetSelectFormField<StableBondsFormValues>
              label="Your deposit"
              assetFieldName="depositAsset"
              amountFieldName="depositAmount"
              assets={depositAssets}
              maxBalanceFallback="0"
            />

            <AssetSwitcher
              assetInId={depositAssetId}
              assetOutId={STABLE_BONDS_ASSET_ID}
              fallbackPrice={spotPrice ?? undefined}
              isFallbackPriceLoading={isSpotPricePending}
            />

            <AssetInput
              label="Receive at maturity"
              symbol={receiveAsset.symbol}
              selectedAssetIcon={
                <AssetLogo id={STABLE_BONDS_ASSET_ID} size="medium" />
              }
              modalDisabled
              disabledInput
              ignoreBalance
              value={receiveAmount}
              displayValue={
                receiveAmount
                  ? t("currency", {
                      value: receiveAmount,
                    })
                  : undefined
              }
            />
          </Box>

          <Separator mx="-xl" />

          <SummaryRow
            label={
              <Flex align="center" gap="base">
                <Lock size={14} />
                <Text fs="p5">Maturity period</Text>
              </Flex>
            }
            content={`${FAKE_STRATEGY.maturityPeriodDays} days`}
          />

          <Separator mx="-xl" />

          <Box py="xl">
            <AuthorizedAction size="large" width="100%">
              <Button
                type="submit"
                size="large"
                width="100%"
                disabled={depositAmountNum <= 0}
              >
                {t("confirm")}
              </Button>
            </AuthorizedAction>
          </Box>

          <Separator mx="-xl" />

          <Summary>
            <SummaryRow
              label="Total fees"
              content={t("currency", { value: TOTAL_FEES_USD })}
            />
          </Summary>
        </Paper>
      </form>
    </FormProvider>
  )
}
