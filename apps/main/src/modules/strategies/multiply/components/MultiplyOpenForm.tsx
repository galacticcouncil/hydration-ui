import {
  Alert,
  AssetInput,
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  FormLabel,
  LoadingButton,
  Paper,
  Separator,
  Slider,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useAccountBalances } from "@/api/balances/account.hooks"
import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { HealthFactorNumber } from "@/modules/money-market/health-factor/HealthFactorNumber"
import { useMultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm.form"
import {
  MULTIPLY_DEFAULT_LEVERAGE,
  MULTIPLY_LEVERAGE_STEP,
  MULTIPLY_MIN_LEVERAGE,
} from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useFactoryMaxLeverage } from "@/modules/strategies/multiply/hooks/useLooperFactory"
import { type MultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useOpenMultiplyPosition } from "@/modules/strategies/multiply/hooks/useOpenMultiplyPosition"
import { projectMultiplyPosition } from "@/modules/strategies/multiply/utils/projection"
import { useAssets } from "@/providers/assetsProvider"
import { percentageOf } from "@/utils/formatting"

type MultiplyOpenFormProps = {
  pair: MultiplyPair
  metrics: MultiplyPairMetrics
  collateralPriceUsd: number
  debtPriceUsd: number
}

export const MultiplyOpenForm: React.FC<MultiplyOpenFormProps> = ({
  pair,
  metrics,
  collateralPriceUsd,
  debtPriceUsd,
}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const { data: factoryMaxLeverage } = useFactoryMaxLeverage(pair)
  const openMutation = useOpenMultiplyPosition(pair)

  const collateral = getAssetWithFallback(pair.collateralAssetId)
  const debt = getAssetWithFallback(pair.debtAssetId)
  const feeAsset = getAssetWithFallback(pair.feeAssetId)
  const aCollateral = getAssetWithFallback(pair.aCollateralAssetId.toString())

  const balance = formatUnits(
    getTransferableBalance(pair.collateralAssetId),
    collateral.decimals,
  )
  const hasFeeBudget = getTransferableBalance(pair.feeAssetId) >= pair.feeBudget

  const maxLeverage = factoryMaxLeverage
    ? Math.min(metrics.maxLeverage, factoryMaxLeverage)
    : metrics.maxLeverage

  const form = useMultiplyOpenForm({
    maxBalance: balance,
    defaultLeverage: Math.min(MULTIPLY_DEFAULT_LEVERAGE, maxLeverage),
  })
  const { control, handleSubmit, watch, formState } = form
  const [amount, leverage] = watch(["amount", "leverage"])

  const projection = projectMultiplyPosition({
    amount: Number(amount || 0),
    collateralPriceUsd,
    debtPriceUsd,
    leverage,
    lt: metrics.lt,
    minHf: metrics.minHf,
    supplyApy: metrics.supplyApy ?? 0,
    borrowApy: metrics.borrowApy ?? 0,
  })

  const leverageLabel = (value: number) =>
    t("cards.multiply.leverage", { value })
  const feeBudget = formatUnits(pair.feeBudget, feeAsset.decimals)

  const canSubmit =
    formState.isValid &&
    hasFeeBudget &&
    !metrics.unavailableReason &&
    !openMutation.isPending

  const onSubmit = handleSubmit(({ amount, leverage }) =>
    openMutation.mutate({
      amount,
      leverage,
      collateralPriceInDebt: collateralPriceUsd / debtPriceUsd,
    }),
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Paper px="xl">
          <Stack gap="l" py="xl">
            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <AssetInput
                  label={t("multiply.open.deposit")}
                  asset={{
                    symbol: collateral.symbol,
                    icon: <AssetLogo id={collateral.id} />,
                  }}
                  value={field.value}
                  onChange={field.onChange}
                  displayValue={t("common:currency", {
                    value: Number(field.value || 0) * collateralPriceUsd,
                  })}
                  balance={{
                    label: t("common:balance"),
                    value: t("common:number", { value: balance }),
                    onMax: () => field.onChange(balance),
                    onPercentage: (percent) =>
                      field.onChange(
                        percentageOf(balance, percent, collateral.decimals),
                      ),
                    isMaxDisabled: !(Number(balance) > 0),
                  }}
                  amountError={fieldState.error?.message}
                />
              )}
            />

            <Separator mx="-xl" />

            <Box>
              <Flex justify="space-between" mb="s">
                <FormLabel>{t("multiply.open.leverage")}</FormLabel>
                <Text fs="p5" fw={600} color={getToken("text.high")}>
                  {leverageLabel(leverage)}
                </Text>
              </Flex>
              <Controller
                control={control}
                name="leverage"
                render={({ field }) => (
                  <Stack gap="s">
                    <Slider
                      min={MULTIPLY_MIN_LEVERAGE}
                      max={maxLeverage}
                      step={MULTIPLY_LEVERAGE_STEP}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <Flex justify="space-between">
                      <Text fs="p5" color={getToken("text.medium")}>
                        {leverageLabel(MULTIPLY_MIN_LEVERAGE)}
                      </Text>
                      <Text fs="p5" color={getToken("text.medium")}>
                        {leverageLabel(maxLeverage)}
                      </Text>
                    </Flex>
                  </Stack>
                )}
              />
            </Box>

            <Separator mx="-xl" />

            <Paper p="m" shadow={false}>
              <Flex justify="space-between" align="center">
                <Stack>
                  <Text fs="p4">{t("multiply.open.multiplied")}</Text>
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("multiply.open.leverageValue", {
                      value: leverageLabel(leverage),
                    })}
                  </Text>
                </Stack>
                <Stack align="end">
                  <Text fs="p2" fw={600} color={getToken("text.high")}>
                    {t("common:currency", {
                      prefix: t("common:approx.short"),
                      value: projection.collateral,
                      symbol: aCollateral.symbol,
                    })}
                  </Text>
                  <Text fs="p6" color={getToken("text.medium")}>
                    {t("common:currency", { value: projection.collateralUsd })}
                  </Text>
                </Stack>
              </Flex>
            </Paper>

            {metrics.unavailableReason && (
              <Alert
                variant="warning"
                title={t(`multiply.unavailable.${metrics.unavailableReason}`)}
              />
            )}
            {account && !hasFeeBudget && (
              <Alert
                variant="warning"
                title={t("multiply.open.feeBudgetLow", {
                  amount: feeBudget,
                  symbol: feeAsset.symbol,
                })}
              />
            )}

            <AuthorizedAction size="large" width="100%">
              <LoadingButton
                type="submit"
                size="large"
                width="100%"
                isLoading={openMutation.isPending}
                disabled={!canSubmit}
                disabledVariant="muted"
              >
                {t("multiply.open.cta")}
              </LoadingButton>
            </AuthorizedAction>
          </Stack>

          <CollapsibleRoot open={Number(amount) > 0}>
            <CollapsibleContent>
              <Separator mx="-xl" />
              <Summary separator={<Separator mx="-xl" />}>
                <SummaryRow
                  label={t("multiply.open.totalCollateral")}
                  content={t("common:currency", {
                    prefix: t("common:approx.short"),
                    value: projection.collateral,
                    symbol: aCollateral.symbol,
                  })}
                />
                <SummaryRow
                  label={t("multiply.open.totalDebt")}
                  content={t("common:currency", {
                    prefix: t("common:approx.short"),
                    value: projection.debt,
                    symbol: debt.symbol,
                  })}
                />
                <SummaryRow
                  label={t("common:healthFactor")}
                  content={
                    <HealthFactorNumber
                      value={projection.healthFactor.toString()}
                    />
                  }
                />
                <SummaryRow
                  label={t("multiply.open.liquidationPrice")}
                  content={t("common:currency", {
                    value: projection.liquidationPriceUsd,
                  })}
                />
                <SummaryRow
                  label={t("multiply.open.netApy")}
                  content={t("common:percent", {
                    value: projection.netApy * 100,
                  })}
                />
                <SummaryRow
                  label={t("multiply.open.feeBudget")}
                  content={t("common:currency", {
                    value: feeBudget,
                    symbol: feeAsset.symbol,
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
