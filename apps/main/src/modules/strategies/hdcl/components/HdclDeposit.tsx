import { Hourglass, Lock, Zap } from "@galacticcouncil/ui/assets/icons"
import {
  AssetInput,
  Box,
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useHdclDepositForm } from "@/modules/strategies/hdcl/components/HdclDeposit.form"
import { HdclExchangeRate } from "@/modules/strategies/hdcl/components/HdclExchangeRate"
import { HdclLogo } from "@/modules/strategies/hdcl/components/HdclLogo"
import { VaultStats } from "@/modules/strategies/hdcl/hooks/useVaultReads"
import { useAssets } from "@/providers/assetsProvider"

type HdclDepositProps = {
  vaultStats: VaultStats
  balance: number
  onDeposit: (amount: number) => void
  isPending: boolean
}

export const HdclDeposit: React.FC<HdclDepositProps> = ({
  vaultStats,
  balance,
  onDeposit,
  isPending,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const form = useHdclDepositForm({
    maxBalance: balance.toString(),
    minDeposit: vaultStats.minDeposit,
    symbol: hollar.symbol,
  })

  const { control, handleSubmit, watch, formState } = form
  const amount = watch("amount")

  const inputNum = parseFloat(amount) || 0
  const outputHdcl =
    vaultStats.exchangeRate > 0 ? inputNum / vaultStats.exchangeRate : 0

  const amountError = formState.errors.amount?.message

  const canSubmit =
    formState.isValid && !isPending && !vaultStats.depositsPaused

  const ctaLabel = (() => {
    if (amountError) return amountError
    if (vaultStats.depositsPaused) return t("hdcl.deposit.cta.paused")
    return t("common:deposit")
  })()

  const onSubmit = handleSubmit(({ amount }) => {
    onDeposit(parseFloat(amount) || 0)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Paper px="xl" position="relative">
          <Box>
            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <AssetInput
                  label={t("hdcl.deposit.your")}
                  symbol="HOLLAR"
                  selectedAssetIcon={
                    <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />
                  }
                  modalDisabled
                  value={field.value}
                  onChange={field.onChange}
                  displayValue={t("common:currency", {
                    value: inputNum,
                  })}
                  maxBalance={balance.toString()}
                  maxButtonBalance={balance.toString()}
                  amountError={fieldState.error?.message}
                />
              )}
            />

            <HdclExchangeRate exchangeRate={vaultStats.exchangeRate} />

            <AssetInput
              label={t("hdcl.deposit.youReceive")}
              symbol="HDCL"
              selectedAssetIcon={<HdclLogo size={24} />}
              modalDisabled
              disabledInput
              ignoreBalance
              value={outputHdcl.toString()}
              displayValue={t("common:currency", {
                value: outputHdcl * vaultStats.exchangeRate,
              })}
            />
          </Box>

          <Separator mx="-xl" />

          <Summary separator={<Separator mx="-xl" />}>
            <SummaryRow
              label={
                <Flex align="center" gap="base">
                  <Icon component={Lock} size="xs" />
                  <Text fs="p5">{t("hdcl.deposit.lockup")}</Text>
                </Flex>
              }
              content={t("hdcl.deposit.lockupValue", {
                days: vaultStats.maxLockupDays,
              })}
            />
            <Box>
              <Text fs="p5" color={getToken("text.medium")} pt="m" pb="s">
                {t("hdcl.deposit.redeemOptions")}:
              </Text>
              <SummaryRow
                label={
                  <Flex
                    align="center"
                    gap="base"
                    sx={{ color: getToken("text.tint.secondary") }}
                  >
                    <Icon component={Hourglass} size="xs" />
                    <Text
                      fs="p5"
                      fw={500}
                      color={getToken("text.tint.secondary")}
                    >
                      {t("hdcl.deposit.option.queue")}
                    </Text>
                  </Flex>
                }
                content={t("hdcl.deposit.option.queueValue", {
                  days: vaultStats.maxLockupDays,
                })}
              />
            </Box>
            <SummaryRow
              label={
                <Flex
                  align="center"
                  gap="base"
                  sx={{ color: getToken("accents.success.emphasis") }}
                >
                  <Icon component={Zap} size="xs" />
                  <Text
                    fs="p5"
                    fw={500}
                    color={getToken("accents.success.emphasis")}
                  >
                    {t("hdcl.deposit.option.instant")}
                  </Text>
                </Flex>
              }
              content={t("hdcl.deposit.option.instantValue")}
            />
          </Summary>

          <Separator mx="-xl" />

          <Box py="xl">
            <AuthorizedAction size="large" width="100%">
              <Button
                type="submit"
                size="large"
                width="100%"
                disabled={!canSubmit}
              >
                {ctaLabel}
              </Button>
            </AuthorizedAction>
          </Box>
        </Paper>
      </form>
    </FormProvider>
  )
}
