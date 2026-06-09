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
import Big from "big.js"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { BilLogo } from "@/modules/strategies/bil/components/BilLogo"
import {
  projectRate,
  WithdrawMethodPicker,
} from "@/modules/strategies/bil/components/WithdrawMethodPicker"
import { useWithdrawForm } from "@/modules/strategies/bil/components/WithdrawModalForm.form"
import { BIL_HAS_AAVE_LAYER } from "@/modules/strategies/bil/constants"
import type {
  BilPoolPosition,
  BilReserveConfig,
} from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { useInstantQuote } from "@/modules/strategies/bil/hooks/useStableswap"
import type { VaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"
import {
  getBilMaxWithdrawable,
  getBilWithdrawHealthFactor,
} from "@/modules/strategies/bil/utils/hf"

interface Props {
  vaultStats: VaultStats
  bilBalance: number
  withdrawSource: "supplied" | "raw"
  poolPosition: BilPoolPosition | undefined
  reserveConfig: BilReserveConfig | undefined
  onRequestRedeem: (amount: number) => void
  onInstantRedeem?: (amount: number) => void
  instantAvailable: boolean
  isPending: boolean
}

export const WithdrawModalForm = ({
  vaultStats,
  bilBalance,
  withdrawSource,
  poolPosition,
  reserveConfig,
  onRequestRedeem,
  onInstantRedeem,
  instantAvailable,
  isPending,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])

  const isSuppliedWithdraw = withdrawSource === "supplied"
  const hfContextEnabled =
    isSuppliedWithdraw &&
    BIL_HAS_AAVE_LAYER &&
    !!poolPosition &&
    !!reserveConfig

  const hfContext = hfContextEnabled
    ? {
        poolPosition,
        reserveConfig,
        suppliedBalance: bilBalance.toString(),
        exchangeRate: vaultStats.exchangeRate,
      }
    : null

  const maxWithdrawable = hfContext
    ? Big.min(Big(bilBalance.toString()), getBilMaxWithdrawable(hfContext))
    : Big(bilBalance.toString())

  const form = useWithdrawForm({
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
    ? getBilWithdrawHealthFactor({
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

  const amountError = formState.errors.amount?.message

  const ctaLabel = (() => {
    if (amountError) return amountError
    if (method === "instant" && !instantAvailable)
      return t("bil.withdraw.cta.unavailable")
    return t("common:withdraw")
  })()

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
                symbol="BIL"
                selectedAssetIcon={<BilLogo size={24} />}
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
              {t("bil.withdraw.method")}
            </Text>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <WithdrawMethodPicker
                  selected={field.value}
                  onSelect={field.onChange}
                  amountBil={inputNum}
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
                    ? t("bil.withdraw.ackInstant")
                    : t("bil.withdraw.ack")}
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
