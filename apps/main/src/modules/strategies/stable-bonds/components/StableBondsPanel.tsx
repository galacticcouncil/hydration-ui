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
import { formatAssetAmount } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { StableBondsAssetSwitcher } from "@/modules/strategies/stable-bonds/components/StableBondsAssetSwitcher"
import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import { useStableBondsForm } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.query"
import { useSubmitStableBondsOrder } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.submit"
import {
  FAKE_STRATEGY,
  STABLE_BONDS_ASSET_ID,
} from "@/modules/strategies/stable-bonds/constants"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const StableBondsPanel = () => {
  const { t } = useTranslation("common")
  const rpc = useRpcProvider()
  const form = useStableBondsForm()
  const submit = useSubmitStableBondsOrder()
  const { getAssetWithFallback } = useAssets()

  const { data: otcOrders = [], isLoading: isOrdersLoading } =
    useStableBondsOtcOrders()
  const { data: feePct = "0", isPending: isFeePending } = useQuery(
    otcTradeFeeQuery(rpc),
  )

  const depositAssets = useMemo(() => {
    return [
      ...new Map(
        otcOrders.map((order) => [order.assetIn.id, order.assetIn]),
      ).values(),
    ]
  }, [otcOrders])

  const { handleSubmit, watch, setValue } = form
  const [depositAsset, depositAmount] = watch(["depositAsset", "depositAmount"])

  useEffect(() => {
    const firstDepositAsset = depositAssets[0]

    if (!firstDepositAsset) {
      return
    }

    const isSelectedAssetAvailable = depositAssets.some(
      (asset) => asset.id === depositAsset?.id,
    )

    if (!isSelectedAssetAvailable) {
      setValue("depositAsset", firstDepositAsset, { shouldValidate: true })
    }
  }, [depositAsset?.id, depositAssets, setValue])

  const selectedOrder = useMemo(
    () => otcOrders.find((order) => order.assetIn.id === depositAsset?.id),
    [depositAsset?.id, otcOrders],
  )

  useEffect(() => {
    if (
      selectedOrder &&
      !selectedOrder.isPartiallyFillable &&
      depositAmount !== selectedOrder.assetAmountIn
    ) {
      setValue("depositAmount", selectedOrder.assetAmountIn, {
        shouldValidate: true,
      })
    }
  }, [depositAmount, selectedOrder, setValue])

  const depositAssetId = selectedOrder?.assetIn.id ?? ""
  const receiveAsset =
    selectedOrder?.assetOut ?? getAssetWithFallback(STABLE_BONDS_ASSET_ID)

  const inBalance = useAccountBalance(depositAssetId)
  const assetInBalance =
    selectedOrder && inBalance
      ? scaleHuman(inBalance.transferable, selectedOrder.assetIn.decimals)
      : "0"
  const assetInMax = selectedOrder
    ? Big.min(selectedOrder.assetAmountIn, assetInBalance).toString()
    : "0"

  const depositAmountNum = parseFloat(depositAmount) || 0
  const depositAmountBig = depositAmount
    ? Big(depositAmount)
    : Big(depositAmountNum)
  const feeAmount =
    selectedOrder && depositAmountBig.gt(0)
      ? formatAssetAmount(
          depositAmountBig.times(feePct).toString(),
          selectedOrder.assetIn.decimals,
        )
      : ""
  const receiveAmount =
    selectedOrder && depositAmountBig.gt(0)
      ? formatAssetAmount(
          Big.max(depositAmountBig.minus(feeAmount || "0"), 0)
            .div(
              Big(selectedOrder.assetAmountIn).div(
                selectedOrder.assetAmountOut,
              ),
            )
            .toString(),
          selectedOrder.assetOut.decimals,
        )
      : ""
  const isDepositAmountValid =
    !!selectedOrder &&
    depositAmountBig.gt(0) &&
    depositAmountBig.lte(selectedOrder.assetAmountIn) &&
    depositAmountBig.lte(assetInBalance)

  const onSubmit = (values: StableBondsFormValues) => {
    if (!selectedOrder || !receiveAmount) {
      return
    }

    submit.mutate({ values, order: selectedOrder, receiveAmount })
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
              disabled={isOrdersLoading || !selectedOrder}
              hideMaxBalanceAction={!selectedOrder?.isPartiallyFillable}
              maxButtonBalance={assetInMax}
              maxBalanceFallback="0"
            />

            <StableBondsAssetSwitcher />

            <AssetInput
              label="Receive at maturity"
              symbol={receiveAsset.symbol}
              selectedAssetIcon={
                <AssetLogo id={receiveAsset.id} size="medium" />
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
                disabled={
                  !isDepositAmountValid ||
                  isOrdersLoading ||
                  isFeePending ||
                  submit.isPending
                }
              >
                {t("confirm")}
              </Button>
            </AuthorizedAction>
          </Box>

          <Separator mx="-xl" />

          <Summary>
            <SummaryRow
              label="Total fees"
              content={t("currency", {
                value: feeAmount || "0",
                symbol: selectedOrder?.assetIn.symbol,
              })}
            />
          </Summary>
        </Paper>
      </form>
    </FormProvider>
  )
}
