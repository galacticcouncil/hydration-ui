import { type ReserveSummary } from "@galacticcouncil/money-market/types"
import {
  Alert,
  AssetInput,
  Box,
  Button,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  FormLabel,
  LoadingButton,
  Separator,
  Skeleton,
  Slider,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLatest } from "react-use"
import { formatUnits } from "viem"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { useAccountBalances } from "@/api/balances/account.hooks"
import { bestSellQuery } from "@/api/trade"
import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { useMultiplyOpenForm } from "@/modules/strategies/multiply/components/MultiplyOpenForm.form"
import { MultiplyPaySwapSummary } from "@/modules/strategies/multiply/components/MultiplyPaySwapSummary"
import { MultiplyPositionPreview } from "@/modules/strategies/multiply/components/MultiplyPositionPreview"
import { MultiplySwapResult } from "@/modules/strategies/multiply/components/MultiplySwapResult"
import {
  MULTIPLY_DEFAULT_LEVERAGE,
  MULTIPLY_LEVERAGE_STEP,
  MULTIPLY_MIN_LEVERAGE,
} from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { useFactoryMaxLeverage } from "@/modules/strategies/multiply/hooks/useLooperFactory"
import { useLooperRecoveryStore } from "@/modules/strategies/multiply/hooks/useLooperRecoveryStore"
import { useLoopFillCheck } from "@/modules/strategies/multiply/hooks/useLoopFills"
import { type MultiplyPairMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useOpenMultiplyEntry } from "@/modules/strategies/multiply/hooks/useOpenMultiplyEntry"
import { useOpenMultiplyPosition } from "@/modules/strategies/multiply/hooks/useOpenMultiplyPosition"
import { type PairRisk } from "@/modules/strategies/multiply/hooks/usePairRiskLevels"
import {
  usePayMaxBalance,
  usePayQuote,
} from "@/modules/strategies/multiply/hooks/usePayAsset"
import {
  getCapRoom,
  getEntryCost,
  getMaxDeposit,
  projectMultiplyPosition,
} from "@/modules/strategies/multiply/utils/projection"
import { getLooperRecovery } from "@/modules/strategies/multiply/utils/recovery"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { percentageOf } from "@/utils/formatting"

type MultiplyOpenFormProps = {
  pair: MultiplyPair
  /** metrics and reserves are missing while they load; the form shows skeletons */
  metrics?: MultiplyPairMetrics | null
  risk: PairRisk | null
  collateralReserve?: ReserveSummary | null
  debtReserve?: ReserveSummary | null
  /** the asset the user enters with; equals `pair.collateralAssetId` by default */
  payAssetId: string
  /** opens the pay-asset picker from the amount input's asset */
  onAssetClick?: () => void
  /** switches the pay asset; the recovery state uses it to pay with the collateral */
  onPayAssetChange?: (assetId: string) => void
  onSuccess?: () => void
}

// what's left under a cap, or null when uncapped
export const MultiplyOpenForm: React.FC<MultiplyOpenFormProps> = ({
  pair,
  metrics,
  risk,
  collateralReserve,
  debtReserve,
  payAssetId,
  onAssetClick,
  onPayAssetChange,
  onSuccess,
}) => {
  const isLoading = !metrics || !collateralReserve || !debtReserve
  const collateralPriceUsd = Number(collateralReserve?.priceInUsd ?? 0)
  const debtPriceUsd = Number(debtReserve?.priceInUsd ?? 0)
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback, getErc20AToken } = useAssets()
  const display = useResolveAssetDisplay()
  const { account } = useAccount()
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()
  const rpc = useRpcProvider()
  const { data: factoryMaxLeverage } = useFactoryMaxLeverage(pair)
  const openMutation = useOpenMultiplyPosition(pair)
  const entryMutation = useOpenMultiplyEntry(pair)
  const isPending = openMutation.isPending || entryMutation.isPending
  // collateral bought by an entry whose open didn't finish
  const recovered = useLooperRecoveryStore((s) => s.held[pair.slug])
  const isPayingCollateral = payAssetId === pair.collateralAssetId

  const collateral = display(pair.collateralAssetId)
  const debt = display(pair.debtAssetId)
  const aCollateral = getAssetWithFallback(pair.aCollateralAssetId.toString())
  const getRecovery = (maxDeposit: number | null) => {
    if (recovered === undefined) return null
    const recovery = getLooperRecovery({
      held: recovered,
      minAmount: formatUnits(
        BigInt(aCollateral.existentialDeposit),
        collateral.decimals,
      ),
      maxDeposit,
      decimals: collateral.decimals,
    })
    return {
      ...recovery,
      openAmount: recovery.kind === "open" ? recovery.amount : undefined,
    }
  }
  const feeAsset = display(pair.feeAssetId)
  const payAsset = display(payAssetId)

  const payMax = usePayMaxBalance(pair, payAssetId)
  const balance = payMax.maxBalance
  const hasFeeBudget = getTransferableBalance(pair.feeAssetId) >= pair.feeBudget

  const metricsMaxLeverage = metrics?.maxLeverage ?? MULTIPLY_DEFAULT_LEVERAGE
  const maxLeverage = factoryMaxLeverage
    ? Math.min(metricsMaxLeverage, factoryMaxLeverage)
    : metricsMaxLeverage

  const form = useMultiplyOpenForm({
    maxBalance: balance,
    defaultLeverage: Math.min(MULTIPLY_DEFAULT_LEVERAGE, maxLeverage),
    payAssetId,
    defaultAmount: isPayingCollateral
      ? getRecovery(null)?.openAmount
      : undefined,
  })
  const { control, handleSubmit, watch, formState, getValues, setValue } = form
  const [amount, leverage] = watch(["amount", "leverage"])

  // a fee estimate landing moves the max; the amount is checked against it again
  useEffect(() => {
    if (getValues("amount")) form.trigger("amount")
  }, [balance, getValues, form])

  // the max arrives with the metrics and factory, after the form mounts
  useEffect(() => {
    if (getValues("leverage") > maxLeverage) setValue("leverage", maxLeverage)
  }, [maxLeverage, getValues, setValue])

  const quote = usePayQuote(pair, payAssetId, amount)
  // the collateral the loop gets: the typed amount or the quoted sell's output
  const collateralAmount = quote.isSwap
    ? quote.amountOut
      ? Number(formatUnits(quote.amountOut, collateral.decimals))
      : 0
    : Number(amount || 0)

  const { getAssetPrice } = useAssetsPrice([payAssetId])
  const getPriceUsd = (assetId: string) => {
    const price = getAssetPrice(assetId)
    return price.isValid ? Number(price.price) : 0
  }
  const payPrice = getAssetPrice(payAssetId)

  // an aToken held as money-market collateral: paying with it withdraws it
  const payUnderlyingId = getErc20AToken(payAssetId)?.underlyingAssetId
  const [debouncedPayAmount] = useDebouncedValue(amount)
  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(rpc, {
      address: account?.address ?? "",
      fromAssetId: payUnderlyingId ?? "",
      fromAmount: debouncedPayAmount,
    }),
  )

  const projection = projectMultiplyPosition({
    amount: collateralAmount,
    collateralPriceUsd,
    debtPriceUsd,
    leverage,
    lt: metrics?.lt ?? 0,
    minHf: metrics?.minHf ?? 0,
    supplyApy: metrics?.supplyApy ?? 0,
    borrowApy: metrics?.borrowApy ?? 0,
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
        amount: collateralAmount,
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

  const debtRooms = isLoading
    ? []
    : [
        getCapRoom(debtReserve.borrowCap, debtReserve.totalDebt),
        Number(metrics.availableLiquidity),
      ].filter((r) => r !== null)
  const getMaxDepositAt = (leverage: number) =>
    isLoading
      ? null
      : getMaxDeposit({
          leverage,
          collateralPriceUsd,
          debtPriceUsd,
          supplyRoom: getCapRoom(
            collateralReserve.supplyCap,
            collateralReserve.totalLiquidity,
          ),
          debtRoom: debtRooms.length ? Math.min(...debtRooms) : null,
          ceilingRoomUsd: collateralReserve.isIsolated
            ? Number(collateralReserve.availableDebtCeilingUsd)
            : null,
        })
  const maxDeposit = getMaxDepositAt(leverage)
  const overMax = maxDeposit !== null && collateralAmount > maxDeposit

  const canSubmit =
    !isLoading &&
    formState.isValid &&
    hasFeeBudget &&
    !metrics?.unavailableReason &&
    !cantFill &&
    !overMax &&
    payMax.isResolved &&
    Big(amount || "0").lte(balance) &&
    (!quote.isSwap || (quote.state === "ready" && !!quote.tx)) &&
    !isPending

  const recovery = getRecovery(maxDeposit)
  const showRecovery =
    !!recovery && !(isPayingCollateral && amount === recovery.openAmount)
  // only an amount this loop can take, or a switch to the collateral when
  // the amount is unknown; too little or no room offers no open
  const recoveryAction =
    recovery?.openAmount ??
    (recovery?.kind === "unknown" && !isPayingCollateral ? "" : undefined)

  const amountNum = Number(amount || 0)
  const ctaLabel = (() => {
    if (isLoading) return t("multiply.open.cta")
    if (metrics?.unavailableReason)
      return t("multiply.open.ctaState.unavailable")
    if (!(amountNum > 0)) return t("multiply.open.ctaState.enterAmount")
    if (amountNum > Number(balance))
      return t("multiply.open.ctaState.insufficientBalance", {
        symbol: payAsset.symbol,
      })
    if (quote.state === "loading") return t("multiply.open.ctaState.quoting")
    if (quote.state === "noRoute")
      return t("multiply.open.ctaState.noRoute", { symbol: collateral.symbol })
    if (quote.state === "tooSmall") return t("multiply.open.ctaState.tooSmall")
    if (overMax || cantFill) return t("multiply.open.ctaState.tooLarge")
    if (!hasFeeBudget)
      return t("multiply.open.ctaState.feeBudget", { symbol: feeAsset.symbol })
    return t("multiply.open.cta")
  })()

  // step 2 is built after step 1 lands; it reads the market as it is then,
  // at the leverage that was submitted
  const market = useLatest({
    collateralPriceInDebt: collateralPriceUsd / debtPriceUsd,
    getMaxDepositAt,
  })
  const getMarketAt = (leverage: number) => () => ({
    collateralPriceInDebt: market.current.collateralPriceInDebt,
    maxDeposit: market.current.getMaxDepositAt(leverage),
  })

  const onSubmit = handleSubmit(({ amount, leverage }) => {
    if (!quote.isSwap) {
      openMutation.mutate(
        {
          amount,
          leverage,
          collateralPriceInDebt: collateralPriceUsd / debtPriceUsd,
        },
        { onSuccess },
      )
      return
    }
    if (!quote.tx) return
    entryMutation.mutate(
      {
        step1: {
          payAssetId,
          tx: quote.tx,
          paid: t("common:currency", {
            value: amount,
            symbol: payAsset.symbol,
          }),
        },
        leverage,
        getMarket: getMarketAt(leverage),
      },
      { onSuccess },
    )
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Stack gap="l" py="xl">
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetInput
                label={t("multiply.open.deposit")}
                asset={{
                  symbol: payAsset.symbol,
                  icon: <AssetLogo id={payAsset.logoId} />,
                }}
                onAssetClick={onAssetClick}
                value={field.value}
                onChange={field.onChange}
                isDisplayValueLoading={
                  quote.isSwap ? !payPrice.isValid : isLoading
                }
                displayValue={t("common:currency", {
                  value:
                    Number(field.value || 0) *
                    (quote.isSwap
                      ? getPriceUsd(payAssetId)
                      : collateralPriceUsd),
                })}
                balance={{
                  label: t("common:balance"),
                  value: t("common:number", { value: balance }),
                  onMax: () => field.onChange(balance),
                  onPercentage: (percent) =>
                    field.onChange(
                      percentageOf(balance, percent, payAsset.decimals),
                    ),
                  isMaxDisabled: !payMax.isResolved || !(Number(balance) > 0),
                  isLoading: isBalanceLoading,
                }}
                amountError={fieldState.error?.message}
              />
            )}
          />

          {quote.isSwap && (
            <Flex justify="space-between" align="center">
              <FormLabel>{t("multiply.open.youGet")}</FormLabel>
              {quote.state === "loading" ? (
                <Skeleton width={96} />
              ) : (
                <Text fs="p5" fw={600} color={getToken("text.high")}>
                  {t("common:currency", {
                    prefix: t("common:approx.short"),
                    value: collateralAmount,
                    symbol: collateral.symbol,
                  })}
                </Text>
              )}
            </Flex>
          )}

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
                    disabled={isLoading}
                  />
                  <Flex justify="space-between">
                    <Text fs="p5" color={getToken("text.medium")}>
                      {leverageLabel(MULTIPLY_MIN_LEVERAGE)}
                    </Text>
                    <Text fs="p5" color={getToken("text.medium")}>
                      {isLoading ? (
                        <Skeleton width={32} />
                      ) : (
                        leverageLabel(maxLeverage)
                      )}
                    </Text>
                  </Flex>
                </Stack>
              )}
            />
          </Box>

          <Separator mx="-xl" />

          <MultiplyPositionPreview
            amount={collateralAmount}
            leverage={leverage}
            collateral={collateral}
            debt={debt}
            supplyApy={metrics?.supplyApy ?? 0}
            borrowApy={metrics?.borrowApy ?? 0}
            risk={risk}
            projection={projection}
            eModeLabel={
              pair.eMode ? (collateralReserve?.eModeLabel ?? null) : null
            }
            isLoading={isLoading}
          />

          {metrics?.unavailableReason && (
            <Alert
              variant="error"
              description={t(
                `multiply.unavailable.${metrics.unavailableReason}`,
                { collateral: collateral.symbol, debt: debt.symbol },
              )}
            />
          )}
          {quote.state === "noRoute" && (
            <Alert
              variant="error"
              description={t("multiply.open.noRoute", {
                symbolIn: payAsset.symbol,
                symbol: collateral.symbol,
              })}
            />
          )}
          {quote.state === "tooSmall" && (
            <Alert
              variant="error"
              description={t("multiply.open.tooSmall", {
                symbolIn: payAsset.symbol,
                symbol: collateral.symbol,
              })}
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
          {recovery && showRecovery && (
            <Alert
              variant="warning"
              description={t(
                recovery.kind === "open"
                  ? recovery.clamped
                    ? "multiply.open.recovery.clamped"
                    : "multiply.open.recovery.description"
                  : `multiply.open.recovery.${recovery.kind}`,
                {
                  amount: recovered,
                  max: recovery.openAmount,
                  symbol: collateral.symbol,
                },
              )}
              action={
                recoveryAction !== undefined && (
                  <Button
                    type="button"
                    size="small"
                    onClick={() =>
                      isPayingCollateral
                        ? setValue("amount", recoveryAction, {
                            shouldValidate: true,
                          })
                        : onPayAssetChange?.(pair.collateralAssetId)
                    }
                  >
                    {t("multiply.open.recovery.cta", {
                      symbol: collateral.symbol,
                    })}
                  </Button>
                )
              }
            />
          )}
          {payMax.isError && (
            <Alert
              variant="warning"
              description={t("multiply.open.feeUnavailable", {
                symbol: payAsset.symbol,
              })}
            />
          )}
          {account && !isLoading && !isBalanceLoading && !hasFeeBudget && (
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
              isLoading={isPending}
              disabled={!canSubmit}
              disabledVariant="muted"
            >
              {ctaLabel}
            </LoadingButton>
          </AuthorizedAction>
        </Stack>

        <CollapsibleRoot open={Number(amount) > 0}>
          <CollapsibleContent>
            <Separator mx="-xl" />
            <Summary separator={<Separator mx="-xl" />}>
              <SummaryRow
                label={t("multiply.open.liquidationPrice")}
                loading={isLoading}
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
                      base={collateralAmount}
                      symbol={collateral.symbol}
                    />
                  ) : (
                    "-"
                  )
                }
              />
              {quote.isSwap && (
                <MultiplyPaySwapSummary
                  payAsset={getAssetWithFallback(payAssetId)}
                  collateral={getAssetWithFallback(pair.collateralAssetId)}
                  quote={quote}
                />
              )}
              {/* withdrawing an aToken moves the HF only when it backs a borrow */}
              {payUnderlyingId && account && healthFactor?.hasChanged && (
                <SummaryRow
                  label={t("common:healthFactor")}
                  tooltip={t("multiply.open.withdrawHfTooltip", {
                    symbol: payAsset.symbol,
                  })}
                  content={
                    <HealthFactorChange
                      current={healthFactor?.current}
                      projected={healthFactor?.future}
                    />
                  }
                />
              )}
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
      </form>
    </FormProvider>
  )
}
