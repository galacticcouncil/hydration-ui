import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  AssetInput,
  Box,
  Button,
  Checkbox,
  Flex,
  Label,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HDCL_STABLESWAP_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  projectRate,
  WithdrawMethodPicker,
} from "@/modules/strategies/hdcl/components/WithdrawMethodPicker"
import { useWithdrawForm } from "@/modules/strategies/hdcl/components/WithdrawModalForm.form"
import { HDCL_HAS_AAVE_LAYER } from "@/modules/strategies/hdcl/constants"
import type {
  HdclPoolPosition,
  HdclReserveConfig,
} from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import { useInstantQuote } from "@/modules/strategies/hdcl/hooks/useStableswap"
import type { VaultStats } from "@/modules/strategies/hdcl/hooks/useVaultReads"
import {
  getHdclMaxWithdrawable,
  getHdclWithdrawHealthFactor,
} from "@/modules/strategies/hdcl/utils/hf"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  vaultStats: VaultStats
  hdclBalance: number
  withdrawSource: "supplied" | "raw"
  poolPosition: HdclPoolPosition | undefined
  reserveConfig: HdclReserveConfig | undefined
  onRequestRedeem: (amount: number) => void
  onInstantRedeem?: (amount: number) => void
  instantAvailable: boolean
  isPending: boolean
}

export const WithdrawModalForm = ({
  vaultStats,
  hdclBalance,
  withdrawSource,
  poolPosition,
  reserveConfig,
  onRequestRedeem,
  onInstantRedeem,
  instantAvailable,
  isPending,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const hdcl = getAssetWithFallback(HDCL_STABLESWAP_ASSET_ID)

  const isSuppliedWithdraw = withdrawSource === "supplied"
  const hfContextEnabled =
    isSuppliedWithdraw &&
    HDCL_HAS_AAVE_LAYER &&
    !!poolPosition &&
    !!reserveConfig

  const hfContext = hfContextEnabled
    ? {
        poolPosition,
        reserveConfig,
        suppliedBalance: hdclBalance.toString(),
        exchangeRate: vaultStats.exchangeRate,
      }
    : null

  const maxWithdrawable = hfContext
    ? Big.min(Big(hdclBalance.toString()), getHdclMaxWithdrawable(hfContext))
    : Big(hdclBalance.toString())

  const form = useWithdrawForm({
    asset: hdcl,
    maxWithdrawable: maxWithdrawable.toString(),
    minRedeem: vaultStats.minRedeem,
  })

  const { control, handleSubmit, watch, formState } = form
  const [amount, method] = watch(["amount", "method"])

  const isMaxSelected = !!amount && Big(amount).gte(maxWithdrawable.toString())
  const withdrawAmount = isMaxSelected ? maxWithdrawable.toString() : amount
  const inputNum = parseFloat(withdrawAmount) || 0
  const usdValue = inputNum * vaultStats.exchangeRate

  const healthFactor = hfContext
    ? getHdclWithdrawHealthFactor({
        ...hfContext,
        withdrawAmount,
      })
    : null

  const projectedQueueRate = projectRate(
    vaultStats.exchangeRate,
    vaultStats.apr,
    vaultStats.worstCaseWaitDays,
  )
  const queueHollarOut = inputNum * projectedQueueRate
  const { quote: instantQuote } = useInstantQuote(inputNum, queueHollarOut)

  const isInstantMethodAvailable =
    method === "queue" || (instantAvailable && !!onInstantRedeem)

  const canSubmit = formState.isValid && !isPending && isInstantMethodAvailable

  const ctaLabel =
    method === "instant" && !instantAvailable
      ? t("hdcl.withdraw.cta.unavailable")
      : t("common:withdraw")

  const onSubmit = handleSubmit(({ amount, method }) => {
    const isMaxSelected =
      !!amount && Big(amount).gte(maxWithdrawable.toString())
    const withdrawAmount = isMaxSelected ? maxWithdrawable.toString() : amount
    const inputNum = parseFloat(withdrawAmount) || 0

    if (method === "queue") {
      onRequestRedeem(inputNum)
    } else {
      onInstantRedeem?.(inputNum)
    }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <ModalBody>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetInput
                sx={{ pt: 0 }}
                label={t("common:amount")}
                symbol="HDCL"
                selectedAssetIcon={<AssetLogo id={HDCL_STABLESWAP_ASSET_ID} />}
                modalDisabled
                value={field.value}
                onChange={field.onChange}
                balanceLabel={t("common:withdrawableBalance")}
                displayValue={
                  inputNum > 0
                    ? t("common:currency", { value: usdValue })
                    : t("common:currency", { value: 0 })
                }
                maxBalance={maxWithdrawable.toString()}
                maxButtonBalance={maxWithdrawable.toString()}
                amountError={fieldState.error?.message}
              />
            )}
          />

          <ModalContentDivider />

          <Box py="l">
            <Text fs="p5" fw={500} color={getToken("text.medium")} mb="m">
              {t("hdcl.withdraw.method")}
            </Text>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <WithdrawMethodPicker
                  selected={field.value}
                  onSelect={field.onChange}
                  amountHdcl={inputNum}
                  exchangeRate={vaultStats.exchangeRate}
                  aprPercent={vaultStats.apr}
                  worstCaseWaitDays={vaultStats.worstCaseWaitDays}
                  nextMaturityDays={vaultStats.nextMaturityDays}
                  instantQuote={instantQuote}
                  instantAvailable={instantAvailable}
                />
              )}
            />
          </Box>

          {healthFactor && (
            <Summary withLeadingSeparator separator={<ModalContentDivider />}>
              <SummaryRow
                label={t("common:healthFactor")}
                content={<HealthFactorChange {...healthFactor} />}
              />
            </Summary>
          )}
          <ModalContentDivider />

          <Flex align="center" gap="base" pt="l">
            <Controller
              control={control}
              name="acknowledged"
              render={({ field }) => (
                <Label
                  fs="p4"
                  lh={1.2}
                  fw={500}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "base",
                    cursor: "pointer",
                  }}
                >
                  <Checkbox
                    name="withdraw-ack"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                  {method === "instant"
                    ? t("hdcl.withdraw.ackInstant")
                    : t("hdcl.withdraw.ack")}
                </Label>
              )}
            />
          </Flex>
        </ModalBody>
        <Separator />
        <ModalFooter>
          <Button type="submit" size="large" width="100%" disabled={!canSubmit}>
            {ctaLabel}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
