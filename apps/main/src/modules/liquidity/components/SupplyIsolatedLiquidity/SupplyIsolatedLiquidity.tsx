import {
  useMarketReserves,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Skeleton,
  Stack,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData, TErc20AToken } from "@/api/assets"
import {
  TAssetWithBalance,
  useAssetSelectModalAssets,
} from "@/components/AssetSelectModal/AssetSelectModal.utils"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { TradeFee } from "@/components/TradeFee/TradeFee"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  TSupplyIsolatedLiquidityFormValues,
  useSupplyIsolatedLiquidity,
} from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquidity.utils"
import { SupplyIsolatedLiquiditySkeleton } from "@/modules/liquidity/components/SupplyIsolatedLiquidity/SupplyIsolatedLiquiditySkeleton"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { FindingsList } from "@/modules/money-market/actions/FindingsList"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { getApyLabel } from "@/modules/money-market/apy/useApyBreakdownItems"
import { CollateralState } from "@/modules/money-market/CollateralState"
import { useUserAddress } from "@/modules/money-market/hooks"
import { useReserveDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { useAssets } from "@/providers/assetsProvider"
import { formatApyPercent } from "@/utils/formatApyPercent"

const isAsset = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export const SupplyIsolatedLiquidity = ({
  assetId,
  onSubmitted,
}: {
  assetId: string
  onSubmitted: () => void
}) => {
  const { tradable, native, getRelatedAToken, isErc20AToken } = useAssets()
  const { data: reserves } = useMarketReserves()
  const { data: summaries } = useReserveSummaries()
  const relatedAToken = getRelatedAToken(assetId)

  const selectabledAssets = useAssetSelectModalAssets({
    assets: tradable,
    search: "",
    ignoreAssetIds: relatedAToken ? [relatedAToken.id] : undefined,
    highPriorityAssetIds: [assetId],
    lowPriorityAssetIds: [native.id],
  })
  const initialAsset = selectabledAssets.sortedAssets[0]

  const supplyAssetAddress = getAddressFromAssetId(assetId)

  const reserve = reserves?.reserves.find((r) =>
    isAsset(r.underlyingAsset, supplyAssetAddress),
  )
  const summary = summaries?.find((s) =>
    isAsset(s.underlyingAsset, supplyAssetAddress),
  )

  if (
    selectabledAssets.isLoading ||
    !initialAsset ||
    !relatedAToken ||
    !reserve ||
    !summary
  )
    return <SupplyIsolatedLiquiditySkeleton />

  const aToken = isErc20AToken(relatedAToken) ? relatedAToken : undefined

  if (!aToken) throw new Error("A token is not found")

  return (
    <SupplyIsolatedLiquidityBody
      initialAsset={initialAsset}
      selectabledAssets={selectabledAssets.sortedAssets}
      assetId={assetId}
      aToken={aToken}
      summary={summary}
      decimals={reserve.decimals}
      onSubmitted={onSubmitted}
    />
  )
}

const SupplyIsolatedLiquidityBody = ({
  initialAsset,
  selectabledAssets,
  assetId,
  aToken,
  summary,
  decimals,
  onSubmitted,
}: {
  initialAsset: TAssetData
  selectabledAssets: TAssetWithBalance[]
  assetId: string
  aToken: TErc20AToken
  summary: ReserveSummary
  decimals: number
  onSubmitted: () => void
}) => {
  const { t } = useTranslation(["common", "liquidity", "borrow", "trade"])
  const { symbol } = useReserveDisplay(summary)
  const user = useUserAddress()
  const {
    form,
    maxBalance,
    onSubmit,
    findings,
    isAssessing,
    currentHealthFactor,
    projectedHealthFactor,
    isCollateral,
    isBlockedSupply,
    minReceiveAmountShifted,
    apys,
    spotPriceData,
    isPriceLoading,
    isTradeLoading,
    isAaveSupply,
    swap,
    hasTradeAmount,
  } = useSupplyIsolatedLiquidity({
    initialAsset,
    supplyAssetId: assetId,
    aToken,
    asset: summary.underlyingAsset,
    decimals,
    onSubmitted,
  })

  // Open once there is a quote to show; stay open while a new amount re-quotes.
  const isTradeOpen =
    !isAaveSupply && hasTradeAmount && (!!swap || isTradeLoading)

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("borrow:supply.withSymbol", {
          symbol,
        })}
        closable
      />
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <ModalBody sx={{ pb: 0 }}>
          <Box pb="l">
            <AssetSelectFormField<TSupplyIsolatedLiquidityFormValues>
              label={t("amount")}
              assetFieldName="asset"
              amountFieldName="amount"
              sortedAssets={selectabledAssets}
              assets={[]}
              balance={{ value: maxBalance }}
            />
          </Box>

          <ModalContentDivider />

          <Summary separator={<ModalContentDivider />}>
            {apys.map((apy, index) => (
              <SummaryRow
                key={index}
                label={getApyLabel(apy.apyType, true)}
                content={formatApyPercent(t, apy.apy)}
              />
            ))}
            <SummaryRow
              label={t("borrow:collateral.title")}
              loading={isAssessing}
              content={
                <CollateralState
                  status={
                    !isCollateral
                      ? "disabled"
                      : summary.isIsolated
                        ? "isolated"
                        : "enabled"
                  }
                />
              }
            />
            {user && (
              <SummaryRow
                label={t("healthFactor")}
                loading={isAssessing}
                content={
                  <HealthFactorChange
                    current={currentHealthFactor}
                    projected={projectedHealthFactor}
                  />
                }
              />
            )}
          </Summary>

          <CollapsibleRoot open={isTradeOpen}>
            <CollapsibleContent>
              <Summary separator={<ModalContentDivider />} withLeadingSeparator>
                {!isBlockedSupply && (
                  <SummaryRow
                    label={t("minimumReceived")}
                    loading={isTradeLoading}
                    content={t("common:currency", {
                      value: minReceiveAmountShifted,
                      symbol: aToken.symbol,
                    })}
                  />
                )}
                <SummaryRow
                  label={t("price")}
                  content={
                    isPriceLoading ? (
                      <Skeleton width={50} height="100%" />
                    ) : (
                      t("liquidity:liquidity.remove.stablepool.modal.price", {
                        poolSymbol: form.watch("asset").symbol,
                        value: spotPriceData?.spotPrice,
                        symbol: aToken.symbol,
                      })
                    )
                  }
                />
                <SummaryRow
                  label={t("tradeLimit")}
                  content={<TradeLimit type={TradeLimitType.Trade} />}
                />
                <SummaryRow
                  label={t("trade:market.summary.estTradeFees")}
                  content={
                    <TradeFee
                      swap={swap}
                      receiveAsset={aToken}
                      isLoading={isTradeLoading || isAssessing}
                    />
                  }
                />
              </Summary>
            </CollapsibleContent>
          </CollapsibleRoot>

          {findings.length > 0 && (
            <>
              <ModalContentDivider />
              <Stack gap="base" py="base">
                <FindingsList findings={findings} />
              </Stack>
            </>
          )}
        </ModalBody>
        <Separator />
        <ModalFooter>
          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              type="submit"
              size="large"
              width="100%"
              isLoading={isTradeLoading || isAssessing}
              disabled={isBlockedSupply || !form.formState.isValid}
            >
              {t("borrow:supply.withSymbol", {
                symbol,
              })}
            </LoadingButton>
          </AuthorizedAction>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
