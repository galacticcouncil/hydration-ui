import {
  Alert,
  AssetInput,
  Box,
  Checkbox,
  CheckboxLabel,
  Flex,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  Separator,
  Summary,
  SummaryRow,
  SummaryRowValue,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { type Hex } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { useWithdrawForm } from "@/modules/strategies/juicer/components/WithdrawModalForm.form"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import {
  useBaseRates,
  useVaultDisplayAsset,
} from "@/modules/strategies/juicer/hooks/useCollateralEquivalent"
import { useNewWithdrawalEstimate } from "@/modules/strategies/juicer/hooks/useNewWithdrawalEstimate"
import {
  vaultBalancesQuery,
  vaultStatsQuery,
} from "@/modules/strategies/juicer/hooks/useVaultReads"
import { useRequestRedeem } from "@/modules/strategies/juicer/hooks/useVaultWrites"
import { formatEta } from "@/modules/strategies/juicer/utils/withdrawalEta"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { percentageOf } from "@/utils/formatting"

// test chains run minute-scale cooldowns, so the unit follows the length
const cooldownUnit = (seconds: number) => {
  if (seconds < 90)
    return { unit: "seconds" as const, count: Math.max(1, Math.round(seconds)) }
  if (seconds < 5400)
    return { unit: "minutes" as const, count: Math.round(seconds / 60) }
  if (seconds < 172800)
    return { unit: "hours" as const, count: Math.round(seconds / 3600) }
  return { unit: "days" as const, count: Math.round(seconds / 86400) }
}

type WithdrawModalFormProps = {
  vault: JuicerVaultConfig
  onSuccess: () => void
}

export const WithdrawModalForm: FC<WithdrawModalFormProps> = ({
  vault,
  onSuccess,
}) => {
  const { t } = useTranslation(["juicer", "common"])
  const rpc = useRpcProvider()
  const evmAddress = useEvmAddress() as Hex | undefined
  const { getAssetWithFallback } = useAssets()
  const { assetId } = vault
  const { decimals } = getAssetWithFallback(assetId)
  // user-facing unit under the current denomination; share units never
  // surface in this form
  const displayAsset = useVaultDisplayAsset()(vault)
  const { symbol } = displayAsset
  const { getRate } = useBaseRates()
  const baseRate = getRate(vault)

  const { data: stats, isError: statsError } = useQuery(
    vaultStatsQuery(rpc, vault, decimals),
  )
  const { data: balances, isError: balancesError } = useQuery(
    vaultBalancesQuery(rpc, vault, decimals, evmAddress),
  )
  const estimate = useNewWithdrawalEstimate(vault, evmAddress)
  const redeem = useRequestRedeem(vault, { onSuccess })

  const exchangeRate = stats?.exchangeRate ?? 1
  const cooldown = cooldownUnit(stats?.withdrawalDelay ?? 0)
  const rate = baseRate ?? "1"
  const shareBalance = balances?.sharesExact ?? "0"
  // The user thinks in the display asset (ETH); the input takes it and the
  // submit converts back through the collateral spot rate and the share
  // exchange rate. Rounded DOWN both ways so a typed amount never exceeds
  // what the shares cover.
  const maxAssets = Big(shareBalance)
    .times(exchangeRate)
    .times(rate)
    .toFixed(decimals, Big.roundDown)
  const blockedReason =
    !rpc.isReady ||
    !stats ||
    !balances ||
    statsError ||
    balancesError ||
    baseRate === null
      ? "loading"
      : stats.paused
        ? "paused"
        : null

  const form = useWithdrawForm({
    maxBalance: maxAssets,
    minRedeem: stats?.minRedeem ?? 0,
    symbol,
    decimals,
  })
  const { control, handleSubmit, watch, formState, setValue } = form
  // MAX means "every share", not "this many ETH": the display rate moves, so
  // comparing the typed amount to a fresh maximum can leave dust or fail
  // validation for a block. Follow the maximum while MAX stays chosen.
  const [maxChosen, setMaxChosen] = useState(false)
  useEffect(() => {
    if (maxChosen) setValue("amount", maxAssets, { shouldValidate: true })
  }, [maxChosen, maxAssets, setValue])

  const amount = watch("amount")
  // the shares actually escrowed for a typed display-asset amount
  const sharesIn = Big(amount || "0")
    .div(rate)
    .div(exchangeRate)
    .toFixed(decimals, Big.roundDown)

  // an amount below one share unit would submit requestRedeem(0) and revert
  const redeemsShares = maxChosen || Big(sharesIn).gt(0)
  const tooSmall = !redeemsShares && Big(amount || "0").gt(0)
  const canSubmit =
    formState.isValid && redeemsShares && !redeem.isPending && !blockedReason
  // what this request adds to the queue, in collateral units; the wait
  // grows with it, so nothing typed gets no estimate
  const hasAmount = Big(amount || "0").gt(0)
  const { seconds: claimableIn, reserveShort } = estimate(
    Number(Big(amount || "0").div(rate)),
  )
  // an amount the form rejects gets no estimate
  const showEta =
    hasAmount &&
    !blockedReason &&
    claimableIn !== null &&
    !formState.errors.amount &&
    !tooSmall

  // the balance grows as earnings are funded; asking for everything shown
  // submits the EXACT share balance, never a round-trip through the rate
  const onSubmit = handleSubmit(({ amount }) => {
    if (!canSubmit) return
    const isMax = maxChosen || Big(amount).gte(maxAssets)
    redeem.mutate({
      shareAmount: isMax
        ? shareBalance
        : (Big(sharesIn).lt(shareBalance)
            ? Big(sharesIn)
            : Big(shareBalance)
          ).toFixed(decimals, Big.roundDown),
      isMax,
      displayAmount: amount,
    })
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <ModalBody scrollable={false}>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <Box pb="xl" width="100%">
                <AssetInput
                  label={t("common:amount")}
                  asset={{
                    symbol,
                    icon: <AssetLogo id={displayAsset.id} />,
                  }}
                  value={field.value}
                  onChange={(value) => {
                    setMaxChosen(false)
                    field.onChange(value)
                  }}
                  balance={{
                    label: t("common:withdrawableBalance"),
                    value: t("common:number", { value: maxAssets }),
                    onMax: () => {
                      setMaxChosen(true)
                      field.onChange(maxAssets)
                    },
                    onPercentage: (percent) => {
                      setMaxChosen(percent >= 100)
                      field.onChange(percentageOf(maxAssets, percent, decimals))
                    },
                    isMaxDisabled: Big(maxAssets).lte(0),
                  }}
                  amountError={
                    fieldState.error?.message ??
                    (tooSmall ? t("withdraw.validation.tooSmall") : undefined)
                  }
                />
              </Box>
            )}
          />

          <ModalContentDivider />

          {showEta && (
            <Summary separator={<Separator mx="-xl" />}>
              <SummaryRow
                label={t("withdraw.claimableIn")}
                content={
                  // an icon tooltip: the row's own opens sideways, where a
                  // modal has no room for it
                  <Flex align="center" gap="xs">
                    <SummaryRowValue>{formatEta(claimableIn)}</SummaryRowValue>
                    <Tooltip text={t("withdraw.claimableInTooltip")}>
                      <TooltipIcon size="1em" />
                    </Tooltip>
                  </Flex>
                }
              />
            </Summary>
          )}

          {!blockedReason && reserveShort && (
            <Box pt="l">
              <Alert
                variant="warning"
                description={t("withdraw.reserveShort")}
              />
            </Box>
          )}

          {blockedReason && (
            <Box pt="l">
              <Alert
                variant="warning"
                description={t(`withdraw.blocked.${blockedReason}`)}
              />
            </Box>
          )}

          {!blockedReason && (
            <>
              {showEta && <ModalContentDivider />}
              <Flex align="center" gap="base" pt="l">
                <Controller
                  control={control}
                  name="acknowledged"
                  render={({ field }) => (
                    <CheckboxLabel>
                      <Checkbox
                        name="withdraw-ack"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                      {t("withdraw.ack", {
                        symbol,
                        duration: t(`withdraw.cooldown.${cooldown.unit}`, {
                          count: cooldown.count,
                        }),
                      })}
                    </CheckboxLabel>
                  )}
                />
              </Flex>
            </>
          )}
        </ModalBody>
        <Separator />
        <ModalFooter>
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={redeem.isPending}
            disabled={!canSubmit}
          >
            {blockedReason
              ? t("withdraw.cta.unavailable")
              : t("withdraw.cta.withdraw")}
          </LoadingButton>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
