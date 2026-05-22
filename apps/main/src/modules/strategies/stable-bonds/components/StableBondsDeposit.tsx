import { Lock } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Icon,
  LoadingButton,
  Paper,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { hoursToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import {
  type StableBondsFormValues,
  useStableBondsForm,
} from "@/modules/strategies/stable-bonds/components/StableBondsDeposit.form"
import {
  getStableBondsFeeAmount,
  getStableBondsReceiveAmount,
  useSubmitStableBondsOrder,
} from "@/modules/strategies/stable-bonds/components/StableBondsDeposit.utils"
import { StableBondsExchangeRate } from "@/modules/strategies/stable-bonds/components/StableBondsExchangeRate"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { isBond, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export type StableBondsDepositProps = {
  orders: OtcOffer[]
}

export const StableBondsDeposit: React.FC<StableBondsDepositProps> = ({
  orders,
}) => {
  const { t } = useTranslation(["common", "trade", "strategies"])
  const rpc = useRpcProvider()
  const submit = useSubmitStableBondsOrder()
  const { getAssetWithFallback } = useAssets()
  const stableBond = useStableBondsConfig()

  const { data: feePct = "0", isPending: isFeePending } = useQuery(
    otcTradeFeeQuery(rpc),
  )
  const form = useStableBondsForm(orders)

  const depositAssets = useMemo(() => {
    return [
      ...new Map(
        orders.map((order) => [order.assetIn.id, order.assetIn]),
      ).values(),
    ]
  }, [orders])

  const { handleSubmit, watch } = form
  const [depositAsset, depositAmount] = watch(["depositAsset", "depositAmount"])

  const selectedOrder = useMemo(
    () => orders.find((order) => order.assetIn.id === depositAsset?.id),
    [depositAsset?.id, orders],
  )

  const depositAssetId = selectedOrder?.assetIn.id ?? ""
  const receiveAsset = selectedOrder?.assetOut ?? ""

  const underlyingAssetId =
    receiveAsset && isBond(receiveAsset) ? receiveAsset.underlyingAssetId : ""
  const underlyingAsset = getAssetWithFallback(underlyingAssetId)

  const depositBalance = useAccountBalance(depositAssetId)
  const depositAssetBalance =
    selectedOrder && depositBalance
      ? scaleHuman(depositBalance.transferable, selectedOrder.assetIn.decimals)
      : "0"

  const assetInMax = selectedOrder
    ? Big.min(selectedOrder.assetAmountIn, depositAssetBalance).toString()
    : "0"

  const receiveAmount = getStableBondsReceiveAmount(
    selectedOrder,
    depositAmount,
  )

  const feeAmount = getStableBondsFeeAmount(receiveAmount, feePct)

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(
          (values) =>
            selectedOrder &&
            submit.mutate({ values, order: selectedOrder, receiveAmount }),
        )}
      >
        <Paper px="xl">
          <Box>
            <AssetSelectFormField<StableBondsFormValues>
              label={t("strategies:bonds.deposit.yourDeposit")}
              assetFieldName="depositAsset"
              amountFieldName="depositAmount"
              assets={depositAssets}
              disabled={!selectedOrder}
              maxButtonBalance={assetInMax}
            />

            <StableBondsExchangeRate order={selectedOrder} />

            <AssetInput
              label={t("strategies:bonds.deposit.receiveAtMaturity")}
              symbol={underlyingAsset.symbol}
              selectedAssetIcon={
                <AssetLogo id={underlyingAsset.id} size="medium" />
              }
              modalDisabled
              disabledInput
              ignoreBalance
              value={receiveAmount}
              displayValue={t("currency", {
                value: receiveAmount,
              })}
            />
          </Box>

          <Separator mx="-xl" />

          <SummaryRow
            label={
              <Flex align="center" gap="base">
                <Icon component={Lock} size="xs" />
                <Text fs="p5">
                  {t("strategies:bonds.deposit.maturityPeriod")}
                </Text>
              </Flex>
            }
            content={t("interval", {
              value: stableBond?.maturityPeriodDays
                ? hoursToMilliseconds(stableBond?.maturityPeriodDays * 24)
                : 0,
              unit: "d",
            })}
          />

          <Separator mx="-xl" />

          <Box py="xl">
            <AuthorizedAction size="large" width="100%">
              <LoadingButton
                isLoading={submit.isPending}
                type="submit"
                size="large"
                width="100%"
                disabled={
                  !form.formState.isValid ||
                  !selectedOrder ||
                  isFeePending ||
                  submit.isPending
                }
              >
                {t("confirm")}
              </LoadingButton>
            </AuthorizedAction>
          </Box>

          <CollapsibleRoot open={form.formState.isValid}>
            <CollapsibleContent>
              <Separator mx="-xl" />
              <Summary>
                <SummaryRow
                  label={t("trade:otc.fillOrder.tradeFee", {
                    percentage: Big(feePct).times(100).toNumber(),
                  })}
                  content={t("currency", {
                    value: feeAmount,
                    percentage: Big(feePct).times(100).toNumber(),
                    symbol: selectedOrder?.assetOut.symbol,
                  })}
                />
              </Summary>
            </CollapsibleContent>
          </CollapsibleRoot>
        </Paper>
      </form>
    </FormProvider>
  )
}
