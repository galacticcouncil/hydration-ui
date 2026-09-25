import {
  Alert,
  AssetInput,
  Box,
  Checkbox,
  Flex,
  Label,
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
  vaultLoopPositionQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useRequestRedeem } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

// Below 0.5% carry, the haircut is noise next to slippage; show the gross estimate.
const CARRY_DISPLAY_FLOOR = 0.005

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

  const { data: stats } = useQuery(vaultStatsQuery(rpc, vault, decimals))
  const { data: balances } = useQuery(
    vaultBalancesQuery(rpc, vault, decimals, evmAddress),
  )
  const { data: loopPosition } = useQuery(vaultLoopPositionQuery(rpc, vault))
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const redeem = useRequestRedeem(vault, { onSuccess })

  const exchangeRate = stats?.exchangeRate ?? 1
  const shareBalance = (balances?.shares ?? 0).toString()
  const negativeCarry = subLoop?.negativeCarry ?? 0
  const carry = negativeCarry >= CARRY_DISPLAY_FLOOR ? negativeCarry : 0

  const blockedReason = stats?.paused
    ? "paused"
    : loopPosition?.equity === 0n
      ? "noEquity"
      : null

  const form = useWithdrawForm({
    maxBalance: shareBalance,
    minRedeem: stats?.minRedeem ?? 0,
    shareSymbol,
  })
  const { control, handleSubmit, watch, formState } = form

  const amount = watch("amount")
  const assetOut = Big(amount || "0")
    .times(exchangeRate)
    .times(1 - carry)
    .toString()

  const canSubmit = formState.isValid && !redeem.isPending && !blockedReason
  const showCarryNotice = carry > 0 && !blockedReason

  const onSubmit = handleSubmit(({ amount }) => redeem.mutate(amount))

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <ModalBody scrollable={false}>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetInput
                sx={{ pt: 0 }}
                label={t("common:amount")}
                symbol={shareSymbol}
                selectedAssetIcon={<AssetLogo id={assetId} />}
                modalDisabled
                value={field.value}
                onChange={field.onChange}
                balanceLabel={t("common:withdrawableBalance")}
                displayValue={t("common:currency", { value: assetOut })}
                maxBalance={shareBalance}
                maxButtonBalance={shareBalance}
                amountError={fieldState.error?.message}
              />
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
                      {t("withdraw.ack", { symbol, shareSymbol })}
                    </Label>
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
