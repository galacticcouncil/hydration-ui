import { Scale, ShieldCheck } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Icon,
  LoadingButton,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  SummaryRowValue,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { type ComponentType, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isTruthy } from "remeda"
import { formatUnits } from "viem"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { useDepositForm } from "@/modules/strategies/propeller/components/DepositForm.form"
import { DepositSwapSummary } from "@/modules/strategies/propeller/components/DepositSwapSummary"
import {
  PROPELLER_VAULTS,
  vaultCollateralDisplayId,
} from "@/modules/strategies/propeller/config/vaults"
import {
  useBaseRates,
  useVaultDisplayAsset,
} from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { useDepositQuote } from "@/modules/strategies/propeller/hooks/useDepositQuote"
import { depositCapacityQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useDeposit } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import {
  getDepositOptions,
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { TransactionClosedError } from "@/states/transactions"
import { percentageOf, scaleHuman } from "@/utils/formatting"

const DEPOSIT_OPTIONS = getDepositOptions(PROPELLER_VAULTS)

type Props = {
  initialDeposit: PropellerDepositOption
  /** offer only the assets the initial vault accepts */
  lockVault?: boolean
  onSuccess?: () => void
  onSelect?: (deposit: PropellerDepositOption) => void
}

export const DepositForm = ({
  initialDeposit,
  lockVault,
  onSuccess,
  onSelect,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const rpc = useRpcProvider()
  const { getAsset, getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const [selected, setSelected] = useState(initialDeposit)
  const { vault, assetId } = selected

  // the raw pool-share collateral keeps its registry identity (2-Pool-GETH)
  // in the picker, so it stays distinguishable from the GETH ERC20 pay asset
  const collateral = getAssetWithFallback(vault.assetId)
  // everywhere else the collateral is determined, so it wears its product
  // identity (GETH) — same convention as the vault's "backed by" row
  const collateralDisplay = {
    ...collateral,
    symbol: getAssetWithFallback(vaultCollateralDisplayId(vault)).symbol,
  }
  const asset = getAssetWithFallback(assetId)
  // informational amounts (capacity, vault identity) speak the display asset;
  // the pay-asset input and swap details keep their own true units
  const displayAsset = useVaultDisplayAsset()(vault)
  const { getRate } = useBaseRates()
  const baseRate = getRate(vault) ?? "1"
  const toDisplay = (value: string | number) =>
    Big(value).times(baseRate).toString()
  const options = lockVault
    ? DEPOSIT_OPTIONS.filter(
        (o) => o.vault.vaultAddress === initialDeposit.vault.vaultAddress,
      )
    : DEPOSIT_OPTIONS
  const assets = options.map((o) => getAsset(o.assetId)).filter(isTruthy)

  const { data: capacity, isError: capacityError } = useQuery(
    depositCapacityQuery(rpc, vault),
  )
  const deposit = useDeposit(vault, {
    onSuccess: () => {
      deposit.reset()
      // the spent amount would otherwise read "Insufficient balance"
      form.reset()
      onSuccess?.()
    },
  })
  const unavailable =
    !rpc.isReady || !capacity || capacityError || !capacity.ready
  const maximum = formatUnits(capacity?.maximum ?? 0n, collateral.decimals)
  const atCapacity = capacity?.maximum === 0n
  const isPaused = capacity?.paused ?? false

  const isSwap = isSwapDeposit(selected)
  const balance = scaleHuman(getTransferableBalance(assetId), asset.decimals)
  // Capacity is in collateral; a swap deposit bounds its OUTPUT, so express
  // the cap in the pay asset at spot. The swap executes below spot (fees,
  // impact), so a spot-converted fill always lands under the cap.
  const { data: paySpot } = useQuery({
    ...spotPriceQuery(rpc, vault.assetId, assetId),
    enabled: rpc.isReady && isSwap,
  })
  const capacityInPay = !isSwap
    ? maximum
    : paySpot?.spotPrice
      ? Big(maximum).times(paySpot.spotPrice).toString()
      : null
  // Remaining capacity shrinks every block as totalAssets accrues interest, so
  // filling it EXACTLY guarantees an over-max by the next refetch and an
  // ExceedsTvlCap revert by inclusion time. When the cap binds, shave the fill
  // to a 6-decimal floor the drift cannot overtake between signing and inclusion.
  const capacityBound = capacityInPay !== null && Big(balance).gt(capacityInPay)
  const maxButtonBalance = capacityBound
    ? Big(capacityInPay).round(6, Big.roundDown).toString()
    : balance

  // closing the review is not a failure
  const depositFailed =
    deposit.isError && !(deposit.error instanceof TransactionClosedError)

  const form = useDepositForm({
    maxBalance: balance,
    maxCapacity:
      capacityInPay === null
        ? undefined
        : `${Big(capacityInPay).round(6, Big.roundDown)}`,
    symbol: asset.symbol,
    decimals: asset.decimals,
  })
  const { control, handleSubmit, formState, reset, watch } = form

  const quote = useDepositQuote(selected, watch("amount"), asset.decimals)
  const exceedsCapacity =
    isSwap &&
    !!capacity &&
    quote.depositAmount !== undefined &&
    quote.depositAmount > capacity.maximum
  const isSwapReady =
    !isSwap ||
    (!!quote.tx &&
      !quote.isLoading &&
      !exceedsCapacity &&
      (quote.depositAmount ?? 0n) > 0n)

  const canSubmit =
    formState.isValid &&
    isSwapReady &&
    !deposit.isPending &&
    !isPaused &&
    !atCapacity &&
    !unavailable

  const ctaLabel = (() => {
    if (unavailable) return t("deposit.cta.unavailable")
    if (isPaused) return t("deposit.cta.paused")
    if (atCapacity) return t("deposit.cta.full")
    return isSwap ? t("deposit.cta.swapAndDeposit") : t("deposit.cta.deposit")
  })()

  // each reason is one the contract itself enforces (see depositGates)
  const blockedDescription = (() => {
    if (capacityError) return t("deposit.alert.unavailable")
    if (capacity?.ready === false) return t("deposit.alert.notReady")
    if (capacity?.blocker) return t(`deposit.alert.${capacity.blocker}`)
    if (atCapacity) return t("deposit.alert.full")
  })()

  const onSelectAsset = (selectedAsset: TAssetData) => {
    const next = options.find((o) => o.assetId === selectedAsset.id)
    if (!next || next.assetId === assetId) return
    setSelected(next)
    deposit.reset()
    reset()
    onSelect?.(next)
  }

  const onSubmit = handleSubmit(({ amount }) => {
    if (!canSubmit) return
    deposit.mutate(
      isSwap && quote.tx
        ? {
            amount,
            trade: {
              assetIn: assetId,
              tx: quote.tx,
              quotedAmountIn: quote.swap?.amountIn ?? 0n,
            },
          }
        : { amount },
    )
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <Controller
          control={control}
          name="amount"
          render={({ field, fieldState }) => (
            <Box py="l" width="100%">
              <AssetSelect
                label={t("common:asset")}
                assets={assets}
                selectedAsset={asset}
                setSelectedAsset={assets.length > 1 ? onSelectAsset : undefined}
                value={field.value}
                onChange={field.onChange}
                balance={{
                  value: balance,
                  max: maxButtonBalance,
                  onMax: () => field.onChange(maxButtonBalance),
                  onPercentage: (percent) =>
                    field.onChange(
                      percentageOf(maxButtonBalance, percent, asset.decimals),
                    ),
                  isMaxDisabled: !(Number(maxButtonBalance) > 0),
                }}
                amountError={
                  fieldState.error?.message ??
                  (exceedsCapacity
                    ? t("deposit.validation.maximum", {
                        amount: t("common:currency", {
                          value:
                            capacityInPay === null
                              ? maximum
                              : Big(capacityInPay)
                                  .round(6, Big.roundDown)
                                  .toString(),
                          symbol: asset.symbol,
                        }),
                      })
                    : undefined)
                }
              />
            </Box>
          )}
        />

        <Separator mx="-xl" />

        <Stack gap="l" py="xl">
          <BenefitCard
            icon={ShieldCheck}
            label={t("deposit.benefit.managedBorrowing")}
            description={t("deposit.benefit.managedBorrowingDescription")}
          />
          <BenefitCard
            icon={Scale}
            label={t("deposit.benefit.noImpermanentLoss")}
            description={t("deposit.benefit.noImpermanentLossDescription")}
          />
        </Stack>

        <Separator mx="-xl" />

        <Stack gap="xl" pb="xl">
          <Summary separator={<Separator mx="-xl" />} withTrailingSeparator>
            <SummaryRow
              label={t("deposit.vault")}
              content={t("deposit.vault.value", {
                name: vault.shareName,
                // what actually backs the vault — a fact about the collateral
                symbol: collateralDisplay.symbol,
              })}
            />
            <SummaryRow
              label={t("strategy.remainingCapacity")}
              loading={!capacity && !capacityError}
              content={
                capacity
                  ? t("common:currency", {
                      value: toDisplay(maximum),
                      symbol: displayAsset.symbol,
                    })
                  : "-"
              }
            />
            <SummaryRow
              label={t("deposit.deployment")}
              content={
                <Flex align="center" gap="xs">
                  <SummaryRowValue>
                    {t("deposit.deployment.gradual")}
                  </SummaryRowValue>
                  <Tooltip
                    text={
                      <Stack gap="base">
                        {(
                          t("deposit.executionDescription", {
                            returnObjects: true,
                          }) as string[]
                        ).map((line) => (
                          <Text key={line} fw={500} fs="p5">
                            {line}
                          </Text>
                        ))}
                      </Stack>
                    }
                  >
                    <TooltipIcon size="1em" />
                  </Tooltip>
                </Flex>
              }
            />
          </Summary>
          {(blockedDescription || quote.isError || depositFailed) && (
            <Stack gap="base">
              {blockedDescription && (
                <Alert
                  variant="warning"
                  title={ctaLabel}
                  description={blockedDescription}
                />
              )}
              {quote.isError && (
                <Alert
                  variant="warning"
                  description={t("deposit.swap.unavailable", {
                    symbolIn: asset.symbol,
                    symbol: collateralDisplay.symbol,
                  })}
                />
              )}
              {depositFailed && (
                <Alert
                  variant="error"
                  description={
                    isSwap
                      ? t("deposit.swap.failed", {
                          symbol: collateralDisplay.symbol,
                        })
                      : t("deposit.failed")
                  }
                />
              )}
            </Stack>
          )}
          <AuthorizedAction size="large" width="100%">
            <LoadingButton
              type="submit"
              size="large"
              width="100%"
              isLoading={deposit.isPending}
              disabled={!canSubmit}
              disabledVariant={blockedDescription ? "muted" : undefined}
            >
              {ctaLabel}
            </LoadingButton>
          </AuthorizedAction>
        </Stack>
        {isSwap && (
          <CollapsibleRoot
            open={
              !!quote.swap &&
              quote.depositAmount !== undefined &&
              !quote.isLoading &&
              !quote.isError
            }
          >
            <CollapsibleContent>
              <DepositSwapSummary
                assetIn={asset}
                collateral={collateralDisplay}
                quote={quote}
              />
            </CollapsibleContent>
          </CollapsibleRoot>
        )}
      </form>
    </FormProvider>
  )
}

const BenefitCard = ({
  icon,
  label,
  description,
}: {
  icon: ComponentType
  label: string
  description: string
}) => {
  const color = getToken("text.tint.quart")

  return (
    <Stack gap="s" align="flex-start">
      <Flex align="center" gap="s">
        <Icon component={icon} size="s" color={color} />
        <Text fs="p5" lh={1} fw={600} color={color}>
          {label}
        </Text>
      </Flex>
      <Text fs="p5" color={getToken("text.medium")}>
        {description}
      </Text>
    </Stack>
  )
}
