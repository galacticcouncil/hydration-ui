import { UseHealthFactorChangeResult } from "api/borrow"
import { useAccountBalances } from "api/deposits"
import { useMemo, useState } from "react"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useFormContext,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  AddStablepoolProps,
  AddStablepoolWrapperProps,
  stablepoolZodSchema,
  TAddStablepoolFormValues,
  TTransferableBalance,
  useAddStablepoolForm,
  useMaxBalances,
  useMoneyMarketSplitStablepoolExtimationTx,
  useMoneyMarketStablepoolExtimationTx,
  useMoneyMarketStablepoolSubmit,
  useSplitMoneyMarketStablepoolSubmitHandler,
  useStablepoolShares,
  useStablepoolTradeShares,
} from "sections/pools/stablepool/transfer/AddStablepoolLiquidity.utils"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import BN from "bignumber.js"
import { LiquidityLimitField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { Spacer } from "components/Spacer/Spacer"
import { SummaryRow } from "components/Summary/SummaryRow"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { Alert } from "components/Alert"
import { TradeAlert } from "sections/pools/stablepool/components/TradeAlert"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"

type APY = { apy: number }
type JoinStrategyFormWrapperProps = AddStablepoolWrapperProps & APY
type JoinStrategyProps = AddStablepoolProps & APY

export const JoinStrategyFormWrapper = (
  props: JoinStrategyFormWrapperProps,
) => {
  const { data: accountBalances } = useAccountBalances()
  const {
    split,
    reserves,
    asset: { id: selectedAssetId, decimals },
  } = props

  const initialAmounts = split
    ? reserves.map((reserve) => ({
        assetId: reserve.id,
        decimals: reserve.decimals,
        amount: "",
      }))
    : [{ assetId: selectedAssetId, decimals, amount: "" }]

  const transferableBalances = initialAmounts.map(({ assetId, decimals }) => ({
    assetId,
    decimals,
    balance:
      accountBalances?.accountAssetsMap.get(assetId)?.balance?.transferable ??
      "0",
  }))

  return split ? (
    <JoinHollarPoolSplit
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  ) : (
    <JoinHollarPool
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  )
}

const JoinHollarPool = (props: JoinStrategyProps) => {
  const tx = useMoneyMarketStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)

  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    stablepoolZodSchema(balancesMax),
  )

  const { tradeData, hfChange } = useStablepoolTradeShares(
    props.asset,
    props.stablepoolAsset,
    form,
  )

  const { onSubmit } = useMoneyMarketStablepoolSubmit(props, tradeData)

  return (
    <FormProvider {...form}>
      <JoinStrategyForm
        balancesMax={balancesMax}
        hfChange={hfChange}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}

const JoinHollarPoolSplit = (props: JoinStrategyProps) => {
  const tx = useMoneyMarketSplitStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)

  const { onSubmit } = useSplitMoneyMarketStablepoolSubmitHandler(props)
  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    stablepoolZodSchema(balancesMax),
  )

  useStablepoolShares(props, form)

  return (
    <FormProvider {...form}>
      <JoinStrategyForm
        balancesMax={balancesMax}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}

const JoinStrategyForm = (
  props: JoinStrategyProps & {
    balancesMax: TTransferableBalance[]
    hfChange?: UseHealthFactorChangeResult
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  },
) => {
  const { t } = useTranslation()
  const { getErc20 } = useAssets()
  const form = useFormContext<TAddStablepoolFormValues>()
  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const {
    asset,
    setLiquidityLimit,
    isJoinFarms,
    balancesMax,
    stablepoolAsset,
    handleSubmit,
    hfChange,
    split,
    onAssetOpen,
    apy,
    poolId,
    reserves,
  } = props

  const {
    formState: { errors },
    watch,
    control,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const displayTradeAlert = useMemo(
    () =>
      stablepoolAsset.isErc20 &&
      poolId !== asset.id &&
      !reserves.some(
        (reserve) =>
          reserve.id === asset.id ||
          getErc20(reserve.id)?.underlyingAssetId === asset.id,
      ),
    [asset.id, getErc20, poolId, reserves, stablepoolAsset.isErc20],
  )

  const isSubmitDisabled =
    !!errors.amount ||
    !!errors.reserves ||
    (!!hfChange?.isHealthFactorBelowThreshold && !healthFactorRiskAccepted)

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div sx={{ flex: "column", gap: 12 }}>
        {fields.map((field, index) => {
          const balanceMax =
            balancesMax.find(
              (balanceMax) => balanceMax.assetId === field.assetId,
            )?.balance ?? "0"

          return (
            <Controller
              key={index}
              name={`reserves.${index}`}
              control={control}
              render={({
                field: { name, value, onChange },
                fieldState: { error },
              }) => (
                <WalletTransferAssetSelect
                  key={index}
                  name={name}
                  title={t("selectAsset")}
                  value={value.amount}
                  onChange={(v) =>
                    onChange({
                      assetId: field.assetId,
                      decimals: field.decimals,
                      amount: v,
                    })
                  }
                  balance={BN(balanceMax)}
                  balanceMax={BN(balanceMax)}
                  asset={value.assetId}
                  error={error?.message ?? errors.amount?.message}
                  onAssetOpen={!split ? onAssetOpen : undefined}
                />
              )}
            />
          )
        })}
      </div>

      <Spacer size={20} />

      <LiquidityLimitField setLiquidityLimit={setLiquidityLimit} />

      <SummaryRow
        label={t(
          stablepoolAsset.isErc20
            ? "liquidity.stablepool.add.minimalReceived"
            : "liquidity.add.modal.shareTokens",
        )}
        content={t("value.tokenWithSymbol", {
          value: BN(watch("amount")),
          symbol: stablepoolAsset.name,
        })}
        withSeparator
      />
      <SummaryRow
        label={t("apy")}
        content={
          <Text fs={14} color="brightBlue200">
            {t("value.percentage", {
              value: BN(apy),
            })}
          </Text>
        }
        withSeparator
      />

      {hfChange && (
        <>
          <SummaryRow
            label={t("healthFactor")}
            content={
              <HealthFactorChange
                healthFactor={hfChange.currentHealthFactor}
                futureHealthFactor={hfChange.futureHealthFactor}
              />
            }
          />
          <HealthFactorRiskWarning
            accepted={healthFactorRiskAccepted}
            onAcceptedChange={setHealthFactorRiskAccepted}
            isBelowThreshold={hfChange.isHealthFactorBelowThreshold}
          />
        </>
      )}

      <Spacer size={20} />

      <div sx={{ flex: "column", gap: 20 }}>
        {Array.isArray(errors.amount) &&
          errors.amount.map((e, i) => (
            <Alert key={i} variant="warning">
              {e.message}
            </Alert>
          ))}

        {displayTradeAlert && <TradeAlert />}
      </div>

      <Separator
        color="darkBlue401"
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          my: 20,
          width: "auto",
        }}
      />

      <Button variant="primary" fullWidth disabled={isSubmitDisabled}>
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}
