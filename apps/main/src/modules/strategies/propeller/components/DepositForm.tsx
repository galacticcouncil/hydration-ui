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
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { type ComponentType, useEffect, useRef, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { isTruthy } from "remeda"
import { formatUnits, parseUnits } from "viem"

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
import { useDepositMaxBalance } from "@/modules/strategies/propeller/hooks/useDepositMaxBalance"
import { useDepositQuote } from "@/modules/strategies/propeller/hooks/useDepositQuote"
import { FULL_SHARE_BPS } from "@/modules/strategies/propeller/hooks/usePropellerVaults"
import { depositCapacityQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useDeposit } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { isSwapDepositReady } from "@/modules/strategies/propeller/utils/deposit"
import {
  getDepositOptions,
  isOneToOneDeposit,
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { TransactionClosedError } from "@/states/transactions"
import { isNonceClash, isWalletRejection } from "@/utils/errors"
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
      setMaxChosen(false)
      form.reset()
      onSuccess?.()
    },
  })
  const unavailable =
    !rpc.isReady || !capacity || capacityError || !capacity.ready
  const maximum = formatUnits(capacity?.maximum ?? 0n, collateral.decimals)
  // dust left under the cap counts as full (see FULL_SHARE_BPS)
  const atCapacity =
    !!capacity && capacity.maximum * 10_000n <= capacity.cap * FULL_SHARE_BPS
  const isPaused = capacity?.paused ?? false

  const isSwap = isSwapDeposit(selected)
  const balance = scaleHuman(getTransferableBalance(assetId), asset.decimals)
  const reserve = useDepositMaxBalance(selected, balance)
  // an unresolved estimate only holds validation at the wallet balance: MAX and
  // submit wait for it
  // the fee math is not bound to the asset's decimals; a longer amount fails
  // validation, so round down to what the asset can hold
  const spendable = reserve.isResolved
    ? Big(reserve.maxBalance).round(asset.decimals, Big.roundDown).toFixed()
    : balance
  // a buy deposit sizes its own fill to the room and spends only what that
  // costs, so the whole balance is a valid amount and the room never binds it
  const isBuyDeposit = isSwap && !isOneToOneDeposit(selected)
  // Capacity is in collateral; the 1:1 swap bounds its OUTPUT, so express the
  // cap in the pay asset at spot. The swap executes below spot (fees, impact),
  // so a spot-converted fill always lands under the cap.
  const { data: paySpot } = useQuery({
    ...spotPriceQuery(rpc, vault.assetId, assetId),
    enabled: rpc.isReady && isSwap && !isBuyDeposit,
  })
  const capacityInPay = isBuyDeposit
    ? null
    : !isSwap
      ? maximum
      : paySpot?.spotPrice
        ? Big(maximum).times(paySpot.spotPrice).toString()
        : null
  // Remaining capacity shrinks every block as totalAssets accrues interest, so
  // filling it EXACTLY guarantees an over-max by the next refetch and an
  // ExceedsTvlCap revert by inclusion time. When the cap binds, shave the fill
  // to a 6-decimal floor the drift cannot overtake between signing and inclusion.
  const capacityBound =
    capacityInPay !== null && Big(spendable).gt(capacityInPay)
  const maxButtonBalance = capacityBound
    ? Big(capacityInPay).round(6, Big.roundDown).toString()
    : spendable

  // closing the review or rejecting in the wallet is not a failure
  const depositFailed =
    deposit.isError &&
    !(deposit.error instanceof TransactionClosedError) &&
    !isWalletRejection(deposit.error)
  // the collateral the failed deposit tried to add; once it exceeds the room
  // left, other deposits took that room first
  const failedCollateral = deposit.variables
    ? (deposit.variables.trade?.depositAmount ??
      parseUnits(deposit.variables.amount, collateral.decimals))
    : null
  const filledFirst =
    depositFailed &&
    !!capacity &&
    failedCollateral !== null &&
    failedCollateral > capacity.maximum

  const form = useDepositForm({
    maxBalance: spendable,
    maxCapacity:
      capacityInPay === null
        ? undefined
        : `${Big(capacityInPay).round(6, Big.roundDown)}`,
    symbol: asset.symbol,
    decimals: asset.decimals,
  })
  const { control, handleSubmit, formState, reset, watch, setValue } = form

  // MAX means "as much as fits": the balance, the fee and the room left move
  // every block, so a number fixed at the click soon exceeds the maximum.
  // Follow the maximum while MAX stays chosen.
  const [maxChosen, setMaxChosen] = useState(false)
  useEffect(() => {
    if (maxChosen)
      setValue("amount", maxButtonBalance, { shouldValidate: true })
  }, [maxChosen, maxButtonBalance, setValue])

  // the previous account's amount and failed deposit are not this account's
  const { account } = useAccount()
  const address = account?.address
  const shownAddress = useRef(address)
  const { reset: resetDeposit, isPending: isDepositPending } = deposit
  useEffect(() => {
    if (shownAddress.current === address) return
    shownAddress.current = address
    setMaxChosen(false)
    reset()
    // a deposit still in flight keeps its state; its toast reports the result
    if (!isDepositPending) resetDeposit()
  }, [address, reset, resetDeposit, isDepositPending])

  const quote = useDepositQuote(selected, watch("amount"), asset.decimals)
  const exceedsCapacity =
    isSwap &&
    !isBuyDeposit &&
    !!capacity &&
    quote.depositAmount !== undefined &&
    quote.depositAmount > capacity.maximum
  const isSwapReady = !isSwap || (isSwapDepositReady(quote) && !exceedsCapacity)

  const canSubmit =
    formState.isValid &&
    isSwapReady &&
    !deposit.isPending &&
    !isPaused &&
    !atCapacity &&
    !unavailable &&
    reserve.isResolved

  const ctaLabel = (() => {
    if (unavailable) return t("deposit.cta.unavailable")
    if (isPaused) return t("deposit.cta.paused")
    if (atCapacity) return t("deposit.cta.full")
    return isBuyDeposit
      ? t("deposit.cta.swapAndDeposit")
      : t("deposit.cta.deposit")
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
    setMaxChosen(false)
    deposit.reset()
    reset()
    onSelect?.(next)
  }

  const onSubmit = handleSubmit(({ amount }) => {
    if (!canSubmit) return
    deposit.mutate(
      isSwap && quote.tx && quote.depositAmount && quote.maxAmountIn
        ? {
            amount,
            trade: {
              assetIn: assetId,
              tx: quote.tx,
              exact: quote.exact,
              depositAmount: quote.depositAmount,
              maxAmountIn: quote.maxAmountIn,
              leftover: quote.leftover,
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
                onChange={(value) => {
                  setMaxChosen(false)
                  field.onChange(value)
                }}
                balance={{
                  value: balance,
                  max: maxButtonBalance,
                  onMax: () => {
                    setMaxChosen(true)
                    field.onChange(maxButtonBalance)
                  },
                  onPercentage: (percent) => {
                    setMaxChosen(percent >= 100)
                    field.onChange(
                      percentageOf(maxButtonBalance, percent, asset.decimals),
                    )
                  },
                  isMaxDisabled:
                    atCapacity ||
                    !reserve.isResolved ||
                    !(Number(maxButtonBalance) > 0),
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
                !capacity ? (
                  "-"
                ) : atCapacity ? (
                  // the warning alert's colour, like the strategy overview
                  <SummaryRowValue color={getToken("accents.alertAlt.primary")}>
                    {t("strategy.full")}
                  </SummaryRowValue>
                ) : (
                  t("common:currency", {
                    value: toDisplay(maximum),
                    symbol: displayAsset.symbol,
                  })
                )
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
          {(blockedDescription ||
            quote.isError ||
            reserve.isError ||
            depositFailed) && (
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
              {reserve.isError && (
                <Alert
                  variant="warning"
                  description={t("deposit.fee.unavailable", {
                    symbol: asset.symbol,
                  })}
                />
              )}
              {depositFailed && (
                <Alert
                  variant="error"
                  description={
                    isNonceClash(deposit.error)
                      ? t("common:transaction.error.nonceClash")
                      : filledFirst
                        ? [
                            t(
                              isSwap
                                ? "deposit.swap.failed.filled"
                                : "deposit.failed.filled",
                            ),
                            ...(atCapacity
                              ? []
                              : [
                                  t("deposit.failed.room", {
                                    amount: t("common:currency", {
                                      value: toDisplay(maximum),
                                      symbol: displayAsset.symbol,
                                    }),
                                  }),
                                ]),
                          ].join(" ")
                        : isSwap
                          ? t("deposit.swap.failed", { symbol: asset.symbol })
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
