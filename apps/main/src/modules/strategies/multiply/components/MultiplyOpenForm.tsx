import { type ReserveSummary } from "@galacticcouncil/money-market/types"
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
import { useQuery } from "@tanstack/react-query"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { useAccountBalances } from "@/api/balances/account.hooks"
import { bestSellQuery } from "@/api/trade"
import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { useMultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm.form"
import { MultiplyPositionPreview } from "@/modules/strategies/multiply/components/MultiplyPositionPreview"
import { MultiplySwapResult } from "@/modules/strategies/multiply/components/MultiplySwapResult"
import {
  MULTIPLY_DEFAULT_LEVERAGE,
  MULTIPLY_LEVERAGE_STEP,
  MULTIPLY_MIN_LEVERAGE,
} from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useFactoryMaxLeverage } from "@/modules/strategies/multiply/hooks/useLooperFactory"
import { useLoopFillCheck } from "@/modules/strategies/multiply/hooks/useLoopFills"
import { type MultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useOpenMultiplyPosition } from "@/modules/strategies/multiply/hooks/useOpenMultiplyPosition"
import { type PairRisk } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import {
  getEntryCost,
  getMaxDeposit,
  projectMultiplyPosition,
} from "@/modules/strategies/multiply/utils/projection"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { percentageOf } from "@/utils/formatting"

type MultiplyOpenFormProps = {
  pair: MultiplyPair
  metrics: MultiplyPairMetrics
  risk: PairRisk | null
  collateralReserve: ReserveSummary
  debtReserve: ReserveSummary
  onPairClick: () => void
}

// what's left under a cap, or null when uncapped
const capRoom = (cap: string, used: string) =>
  Number(cap) > 0 ? Number(cap) - Number(used) : null

export const MultiplyOpenForm: React.FC<MultiplyOpenFormProps> = ({
  pair,
  metrics,
  risk,
  collateralReserve,
  debtReserve,
  onPairClick,
}) => {
  const collateralPriceUsd = Number(collateralReserve.priceInUsd)
  const debtPriceUsd = Number(debtReserve.priceInUsd)
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()
  const display = useResolveAssetDisplay()
  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const rpc = useRpcProvider()
  const { data: factoryMaxLeverage } = useFactoryMaxLeverage(pair)
  const openMutation = useOpenMultiplyPosition(pair)

  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)
  const aCollateral = getAssetWithFallback(pair.aCollateralAssetId.toString())
  const feeAsset = display(pair.feeAssetId)

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

  // The ramp swaps the whole debt into collateral; quote it to price the entry.
  const [debouncedDebt] = useDebouncedValue(
    projection.debt > 0 ? projection.debt.toFixed(debt.decimals) : "",
  )
  const { data: entryQuote, isLoading: isEntryQuoteLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: pair.debtAssetId,
      // the intent asks for the aToken, so price the entry against it
      assetOut: pair.aCollateralAssetId.toString(),
      amountIn: debouncedDebt,
    }),
  )
  const entryCost = entryQuote
    ? getEntryCost({
        amount: Number(amount || 0),
        debt: Number(debouncedDebt),
        quotedOut: Number(
          formatUnits(entryQuote.amountOut, aCollateral.decimals),
        ),
        collateralPriceInDebt: collateralPriceUsd / debtPriceUsd,
      })
    : null

  const leverageLabel = (value: number) =>
    t("cards.multiply.leverage", { value })
  const feeBudget = formatUnits(pair.feeBudget, feeAsset.decimals)

  const fillCheck = useLoopFillCheck(pair, projection.debtUsd, {
    collateralPriceUsd,
    debtPriceUsd,
  })
  const cantFill = fillCheck.data ? !fillCheck.data.fills : false

  const debtRooms = [
    capRoom(debtReserve.borrowCap, debtReserve.totalDebt),
    Number(metrics.availableLiquidity),
  ].filter((r) => r !== null)
  const maxDeposit = getMaxDeposit({
    leverage,
    collateralPriceUsd,
    debtPriceUsd,
    supplyRoom: capRoom(
      collateralReserve.supplyCap,
      collateralReserve.totalLiquidity,
    ),
    debtRoom: debtRooms.length ? Math.min(...debtRooms) : null,
    ceilingRoomUsd: collateralReserve.isIsolated
      ? Number(collateralReserve.availableDebtCeilingUsd)
      : null,
  })
  const overMax = maxDeposit !== null && Number(amount || 0) > maxDeposit

  const canSubmit =
    formState.isValid &&
    hasFeeBudget &&
    !metrics.unavailableReason &&
    !cantFill &&
    !overMax &&
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
                    icon: <AssetLogo id={collateral.logoId} />,
                  }}
                  onAssetClick={onPairClick}
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

            <MultiplyPositionPreview
              amount={Number(amount || 0)}
              leverage={leverage}
              collateral={collateral}
              debt={debt}
              supplyApy={metrics.supplyApy ?? 0}
              borrowApy={metrics.borrowApy ?? 0}
              risk={risk}
              projection={projection}
              eModeLabel={pair.eMode ? collateralReserve.eModeLabel : null}
            />

            {metrics.unavailableReason && (
              <Alert
                variant="error"
                description={t(
                  `multiply.unavailable.${metrics.unavailableReason}`,
                  { collateral: collateral.symbol, debt: debt.symbol },
                )}
              />
            )}
            {overMax && (
              <Alert
                variant="error"
                description={t("multiply.open.maxAmount", {
                  amount: maxDeposit,
                  symbol: collateral.symbol,
                })}
              />
            )}
            {!overMax && cantFill && (
              <Alert
                variant="error"
                description={t("multiply.open.cantFill", {
                  slippage: pair.slippageBps / 100,
                })}
              />
            )}
            {account && !hasFeeBudget && (
              <Alert
                variant="warning"
                description={t("multiply.open.feeBudgetLow", {
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
                  label={t("multiply.open.liquidationPrice")}
                  content={t("common:currency", {
                    value: projection.liquidationPriceUsd,
                  })}
                />
                <SummaryRow
                  label={
                    entryCost && entryCost.cost < 0
                      ? t("multiply.open.entryGain")
                      : t("multiply.open.entryCost")
                  }
                  tooltip={t("multiply.open.entryTooltip")}
                  loading={isEntryQuoteLoading}
                  content={
                    entryCost ? (
                      <MultiplySwapResult
                        value={-entryCost.cost}
                        base={Number(amount || 0)}
                        symbol={collateral.symbol}
                      />
                    ) : (
                      "-"
                    )
                  }
                />
                <SummaryRow
                  label={t("multiply.open.feeBudget")}
                  tooltip={t("multiply.open.feeBudgetTooltip", {
                    symbol: feeAsset.symbol,
                  })}
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
