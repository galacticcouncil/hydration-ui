import { useMemo, useState } from "react"
import BN from "bignumber.js"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useFormContext,
} from "react-hook-form"
import { useBorrowAssetsApy, UseHealthFactorChangeResult } from "api/borrow"
import { useAddToOmnipoolZod } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import {
  AddMoneyMarketStablepoolProps,
  AddStablepoolProps,
  getReservesZodSchema,
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
} from "./AddStablepoolLiquidity.utils"
import { Alert } from "components/Alert/Alert"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { SummaryRow } from "components/Summary/SummaryRow"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { AvailableFarmsForm } from "sections/pools/modals/AddLiquidity/components/JoinFarmsSection/JoinFarmsSection"
import { LiquidityLimitField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { StablepoolFeeSummaryRow } from "sections/pools/stablepool/components/StablepoolFeeSummaryRow"
import { TradeAlert } from "sections/pools/stablepool/components/TradeAlert"
import { PriceSummaryRow } from "sections/pools/stablepool/components/PriceSummaryRow"
import { Reserves } from "sections/pools/stablepool/components/Reserves"
import { useAssets } from "providers/assets"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"

export const AddSplitMoneyMarketStablepool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const tx = useMoneyMarketSplitStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)
  const { onSubmit } = useSplitMoneyMarketStablepoolSubmitHandler(props)
  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    stablepoolZodSchema(balancesMax),
  )

  const { hfChange } = useStablepoolShares(props, form)

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        handleSubmit={handleSubmit(onSubmit)}
        hfChange={hfChange}
        {...props}
      />
    </FormProvider>
  )
}

export const AddSplitMoneyMarketStablepoolOmnipool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const tx = useMoneyMarketSplitStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)
  const { onSubmit } = useSplitMoneyMarketStablepoolSubmitHandler(props)
  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(
      props.stablepoolAsset,
      props.stablepoolAsset.id,
      props.farms,
      getReservesZodSchema(balancesMax),
    ),
  )

  const { hfChange } = useStablepoolShares(props, form)

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        handleSubmit={handleSubmit(onSubmit)}
        hfChange={hfChange}
        {...props}
      />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepool = (
  props: AddMoneyMarketStablepoolProps,
) => {
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
      <StablepoolForm
        balancesMax={balancesMax}
        hfChange={hfChange}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepoolOmnipool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const tx = useMoneyMarketStablepoolExtimationTx(props)
  const balancesMax = useMaxBalances(props, tx)

  const { form, handleSubmit } = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(
      props.stablepoolAsset,
      props.stablepoolAsset.id,
      props.farms,
      getReservesZodSchema(balancesMax),
    ),
  )

  const { tradeData, hfChange } = useStablepoolTradeShares(
    props.asset,
    props.stablepoolAsset,
    form,
  )

  const { onSubmit } = useMoneyMarketStablepoolSubmit(props, tradeData)

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        hfChange={hfChange}
        handleSubmit={handleSubmit(onSubmit)}
        {...props}
      />
    </FormProvider>
  )
}

export const StablepoolForm = (
  props: AddStablepoolProps & {
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
    poolId,
    reserves,
    farms,
    stablepoolAsset,
    handleSubmit,
    hfChange,
    split,
    setIsJoinFarms,
    onAssetOpen,
    supply,
    isStablepoolOnly,
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
  const isHfRiskAcceptRequired = !!(
    hfChange?.isHealthFactorSignificantChange &&
    hfChange?.isHealthFactorBelowThreshold
  )

  const isSubmitDisabled =
    !!errors.amount ||
    !!errors.reserves ||
    (isHfRiskAcceptRequired && !healthFactorRiskAccepted)

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

      <Reserves reserves={reserves} />

      {!!supply ? (
        <>
          <SummaryRow
            label={t(
              stablepoolAsset.isErc20
                ? "liquidity.stablepool.add.minimalReceived"
                : "liquidity.add.modal.shareTokens",
            )}
            content={t("value.tokenWithSymbol", {
              value: BN(watch("amount")),
              symbol: stablepoolAsset.symbol,
            })}
            withSeparator
          />
          {!split && (
            <PriceSummaryRow
              selectedAsset={asset}
              poolAsset={stablepoolAsset}
            />
          )}

          <SupplyModalDetails {...props} />
        </>
      ) : (
        <>
          <LiquidityLimitField
            setLiquidityLimit={setLiquidityLimit}
            type={split || !stablepoolAsset.isErc20 ? "liquidity" : "swap"}
          />

          <StablepoolFeeSummaryRow poolId={poolId} />

          {!isStablepoolOnly && (
            <AvailableFarmsForm
              name="farms"
              farms={farms}
              isJoinFarms={isJoinFarms}
              setIsJoinFarms={setIsJoinFarms}
            />
          )}

          <Text
            color="pink500"
            fs={15}
            font="GeistMono"
            tTransform="uppercase"
            sx={{ mt: 16 }}
          >
            {t("liquidity.add.modal.positionDetails")}
          </Text>

          <SummaryRow
            label={t(
              stablepoolAsset.isErc20
                ? "liquidity.stablepool.add.minimalReceived"
                : "liquidity.add.modal.shareTokens",
            )}
            content={t("value.tokenWithSymbol", {
              value: BN(watch("amount")),
              symbol: stablepoolAsset.symbol,
            })}
            withSeparator
          />

          {!split && (
            <PriceSummaryRow
              selectedAsset={asset}
              poolAsset={stablepoolAsset}
            />
          )}
        </>
      )}

      {hfChange && (
        <SummaryRow
          label={t("healthFactor")}
          content={
            <HealthFactorChange
              healthFactor={hfChange.currentHealthFactor}
              futureHealthFactor={hfChange.futureHealthFactor}
            />
          }
        />
      )}

      <div sx={{ flex: "column", gap: 20 }}>
        {hfChange?.isHealthFactorSignificantChange && (
          <HealthFactorRiskWarning
            accepted={healthFactorRiskAccepted}
            onAcceptedChange={setHealthFactorRiskAccepted}
            isBelowThreshold={hfChange.isHealthFactorBelowThreshold}
          />
        )}

        {Array.isArray(errors.amount) &&
          errors.amount.map((e, i) => (
            <Alert key={i} variant="warning">
              {e.message}
            </Alert>
          ))}
        {!supply && <PoolAddLiquidityInformationCard />}
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
          : supply
            ? t("supply")
            : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}

export const SupplyModalDetails = ({
  stablepoolAsset,
  poolId,
}: AddStablepoolProps) => {
  const { t } = useTranslation()
  const { data: apys } = useBorrowAssetsApy([poolId])
  const apy = apys[0]

  if (!apy) return null

  const supplyApy = BN(apy.underlyingSupplyApy).plus(apy.lpAPY)

  return (
    <>
      <SummaryRow
        label={t("supplyApy")}
        withSeparator
        content={t("value.percentage", { value: supplyApy })}
      />

      {!!apy.incentives.length && (
        <SummaryRow
          label={t("lending.rewardsAPR")}
          withSeparator
          content={
            <IncentivesButton
              incentives={apy.incentives}
              symbol={stablepoolAsset.symbol}
            />
          }
        />
      )}
    </>
  )
}
