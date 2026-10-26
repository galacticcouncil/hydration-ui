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
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { type Hex } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { useWithdrawForm } from "@/modules/strategies/propeller/components/WithdrawModalForm.form"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  useBaseRates,
  useVaultDisplayAsset,
} from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import {
  subLoopQuery,
  vaultBalancesQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useRequestRedeem } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { percentageOf } from "@/utils/formatting"

/** test chains run minute-scale cooldowns; '0.01667-hour' is not a duration */
const formatCooldown = (seconds: number) => {
  if (seconds < 90) return `${Math.max(1, Math.round(seconds))}-second`
  if (seconds < 5400) return `${Math.round(seconds / 60)}-minute`
  if (seconds < 172800) return `${Math.round(seconds / 3600)}-hour`
  return `${Math.round(seconds / 86400)}-day`
}

type Props = {
  vault: PropellerVaultConfig
  onSuccess: () => void
}

export const WithdrawModalForm = ({ vault, onSuccess }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
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
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const redeem = useRequestRedeem(vault, { onSuccess })

  const exchangeRate = stats?.exchangeRate ?? 1
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
  const negativeCarry = subLoop?.negativeCarry ?? 0
  const carry = negativeCarry

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
  const canSubmit =
    formState.isValid && redeemsShares && !redeem.isPending && !blockedReason
  const showCarryNotice = carry > 0 && !blockedReason

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
                  amountError={fieldState.error?.message}
                />
              </Box>
            )}
          />

          <ModalContentDivider />

          {showCarryNotice && (
            <Box py="l">
              <Text fs="p6" color={getToken("text.low")}>
                {t("withdraw.carryEstimate", { carry })}
              </Text>
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
              {showCarryNotice && <ModalContentDivider />}
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
                        duration: formatCooldown(stats?.withdrawalDelay ?? 0),
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
