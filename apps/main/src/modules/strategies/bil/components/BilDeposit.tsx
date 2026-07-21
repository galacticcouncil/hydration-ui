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
import { BIL_ERC20_ID, HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useBilDepositForm } from "@/modules/strategies/bil/components/BilDeposit.form"
import { BilExchangeRate } from "@/modules/strategies/bil/components/BilExchangeRate"
import { VaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"
import { useAssets } from "@/providers/assetsProvider"

type BilDepositProps = {
  vaultStats: VaultStats
  balance: number
  onDeposit: (amount: number) => void
  isPending: boolean
}

export const BilDeposit: React.FC<BilDepositProps> = ({
  vaultStats,
  balance,
  onDeposit,
  isPending,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const form = useBilDepositForm({
    maxBalance: balance.toString(),
    minDeposit: vaultStats.minDeposit,
    symbol: hollar.symbol,
  })

  const { control, handleSubmit, watch, formState } = form
  const amount = watch("amount")

  const inputNum = parseFloat(amount) || 0
  const outputBil =
    vaultStats.exchangeRate > 0 ? inputNum / vaultStats.exchangeRate : 0

  const canSubmit =
    formState.isValid && !isPending && !vaultStats.depositsPaused

  const ctaLabel = vaultStats.depositsPaused
    ? t("bil.deposit.cta.paused")
    : t("common:deposit")

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
                  label={t("bil.deposit.your")}
                  symbol="HOLLAR"
                  selectedAssetIcon={<AssetLogo id={HOLLAR_ASSET_ID} />}
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

            <BilExchangeRate exchangeRate={vaultStats.exchangeRate} />

            <AssetInput
              label={t("bil.deposit.youReceive")}
              symbol="BIL"
              selectedAssetIcon={<AssetLogo id={BIL_ERC20_ID} />}
              modalDisabled
              disabledInput
              ignoreBalance
              value={outputBil.toString()}
              displayValue={t("common:currency", {
                value: outputBil * vaultStats.exchangeRate,
              })}
            />
          </Box>

          <Separator mx="-xl" />

          <Summary separator={<Separator mx="-xl" />}>
            <SummaryRow
              label={
                <Flex align="center" gap="base">
                  <Icon component={Lock} size="xs" />
                  <Text fs="p5">{t("bil.deposit.lockup")}</Text>
                </Flex>
              }
              content={t("bil.deposit.lockupValue", {
                days: vaultStats.maxLockupDays,
              })}
            />
            <Box>
              <Text fs="p5" color={getToken("text.medium")} pt="m" pb="s">
                {t("bil.deposit.redeemOptions")}:
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
                      {t("bil.deposit.option.queue")}
                    </Text>
                  </Flex>
                }
                content={
                  <Text sx={{ flex: 1 }}>
                    {t("bil.deposit.option.queueValue", {
                      days: vaultStats.maxLockupDays,
                    })}
                  </Text>
                }
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
                    {t("bil.deposit.option.instant")}
                  </Text>
                </Flex>
              }
              content={
                <Text align="right" sx={{ flex: 1 }}>
                  {t("bil.deposit.option.instantValue")}
                </Text>
              }
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
