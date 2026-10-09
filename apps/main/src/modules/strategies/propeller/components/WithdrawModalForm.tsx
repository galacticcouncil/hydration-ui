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
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { type Hex } from "viem"

import { AssetLogo } from "@/components/AssetLogo"
import { useWithdrawForm } from "@/modules/strategies/propeller/components/WithdrawModalForm.form"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  subLoopQuery,
  vaultBalancesQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useRequestRedeem } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { percentageOf } from "@/utils/formatting"

type Props = {
  vault: PropellerVaultConfig
  onSuccess: () => void
}

export const WithdrawModalForm = ({ vault, onSuccess }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const rpc = useRpcProvider()
  const evmAddress = useEvmAddress() as Hex | undefined
  const { getAssetWithFallback } = useAssets()
  const { assetId, shareSymbol } = vault
  const { symbol, decimals } = getAssetWithFallback(assetId)

  const { data: stats, isError: statsError } = useQuery(
    vaultStatsQuery(rpc, vault, decimals),
  )
  const { data: balances, isError: balancesError } = useQuery(
    vaultBalancesQuery(rpc, vault, decimals, evmAddress),
  )
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const redeem = useRequestRedeem(vault, { onSuccess })

  const exchangeRate = stats?.exchangeRate ?? 1
  const shareBalance = balances?.sharesExact ?? "0"
  const negativeCarry = subLoop?.negativeCarry ?? 0
  const carry = negativeCarry

  const blockedReason =
    !rpc.isReady || !stats || !balances || statsError || balancesError
      ? "loading"
      : stats.paused
        ? "paused"
        : null

  const form = useWithdrawForm({
    maxBalance: shareBalance,
    minRedeem: stats?.minRedeem ?? 0,
    shareSymbol,
    decimals,
  })
  const { control, handleSubmit, watch, formState } = form

  const amount = watch("amount")
  const assetOut = Big(amount || "0")
    .times(exchangeRate)
    .toString()

  const canSubmit = formState.isValid && !redeem.isPending && !blockedReason
  const showCarryNotice = carry > 0 && !blockedReason

  // the balance grows as earnings are funded; max redeems all of it
  const onSubmit = handleSubmit(({ amount }) => {
    if (canSubmit)
      redeem.mutate({
        shareAmount: amount,
        isMax: Big(amount).eq(shareBalance),
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
                    symbol: shareSymbol,
                    icon: <AssetLogo id={assetId} />,
                  }}
                  value={field.value}
                  onChange={field.onChange}
                  displayValue={t("common:currency", { value: assetOut })}
                  balance={{
                    label: t("common:withdrawableBalance"),
                    value: t("common:number", { value: shareBalance }),
                    onMax: () => field.onChange(shareBalance),
                    onPercentage: (percent) =>
                      field.onChange(
                        percentageOf(shareBalance, percent, decimals),
                      ),
                    isMaxDisabled: Big(shareBalance).lte(0),
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
                        shareSymbol,
                        hours: (stats?.withdrawalDelay ?? 0) / 3600,
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
