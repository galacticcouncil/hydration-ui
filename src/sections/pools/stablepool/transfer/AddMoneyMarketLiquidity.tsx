import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { ReactNode, useState } from "react"
import BN from "bignumber.js"
import {
  Controller,
  FieldErrors,
  FormProvider,
  useFieldArray,
  useFormContext,
} from "react-hook-form"
import { useBestTradeSell } from "api/trade"
import { scaleHuman } from "utils/balance"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useHealthFactorChange } from "api/borrow"
import { ProtocolAction } from "@aave/contract-helpers"
import { useAddToOmnipoolZod } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { Trans, useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { useRefetchAccountAssets } from "api/deposits"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import {
  AddMoneyMarketStablepoolProps,
  addStablepoolToast,
  getReservesZodSchema,
  stablepoolZodSchema,
  TAddStablepoolFormValues,
  TTransferableBalance,
  useAddStablepoolForm,
  useMoneyMarketStablepoolSubmitHandler,
  useSplitMoneyMarketStablepoolSubmitHandler,
  useStablepoolShares,
} from "./AddStablepoolLiquidity.utils"
import { Alert } from "components/Alert/Alert"
import { Spacer } from "components/Spacer/Spacer"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { CurrencyReserves } from "sections/pools/stablepool/components/CurrencyReserves"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { SummaryRow } from "components/Summary/SummaryRow"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { useSpotPrice } from "api/spotPrice"
import { TAsset, TErc20, useAssets } from "providers/assets"
import { AvailableFarmsForm } from "sections/pools/modals/AddLiquidity/components/JoinFarmsSection/JoinFarmsSection"
import { LiquidityLimitField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { StablepoolFeeSummaryRow } from "sections/pools/stablepool/components/StablepoolFeeSummaryRow"
import { StepProps } from "components/Stepper/Stepper"

export const AddSplitMoneyMarketStablepool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const { balancesMax, onSubmit } =
    useSplitMoneyMarketStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(props, stablepoolZodSchema(balancesMax))

  return (
    <FormProvider {...form}>
      <SplitMoneyMarketStablepoolForm
        balancesMax={balancesMax}
        onSubmit={onSubmit}
        {...props}
      />
    </FormProvider>
  )
}

export const AddSplitMoneyMarketStablepoolOmnipool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const {
    isJoinFarms,
    setIsJoinFarms,
    pool: { farms, id },
  } = props
  const { balancesMax, onSubmit } =
    useSplitMoneyMarketStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(id, getReservesZodSchema(balancesMax)),
  )

  return (
    <FormProvider {...form}>
      <SplitMoneyMarketStablepoolForm
        balancesMax={balancesMax}
        onSubmit={onSubmit}
        availableFarms={
          <AvailableFarmsForm
            name="farms"
            farms={farms}
            isJoinFarms={isJoinFarms}
            setIsJoinFarms={setIsJoinFarms}
          />
        }
        {...props}
      />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const { balancesMax } = useMoneyMarketStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(props, stablepoolZodSchema(balancesMax))

  return (
    <FormProvider {...form}>
      <MoneyMarketStablepoolForm balancesMax={balancesMax} {...props} />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepoolOmnipool = (
  props: AddMoneyMarketStablepoolProps,
) => {
  const {
    isJoinFarms,
    setIsJoinFarms,
    pool: { farms, id },
  } = props

  const { balancesMax, getStepper, onJoinOmnipool } =
    useMoneyMarketStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(id, getReservesZodSchema(balancesMax)),
  )

  return (
    <FormProvider {...form}>
      <MoneyMarketStablepoolForm
        balancesMax={balancesMax}
        onJoinOmnipool={onJoinOmnipool}
        getStepper={getStepper}
        availableFarms={
          <AvailableFarmsForm
            name="farms"
            farms={farms}
            isJoinFarms={isJoinFarms}
            setIsJoinFarms={setIsJoinFarms}
          />
        }
        {...props}
      />
    </FormProvider>
  )
}

export const MoneyMarketStablepoolForm = (
  props: AddMoneyMarketStablepoolProps & {
    balancesMax: TTransferableBalance[]
    onJoinOmnipool?: (values: TAddStablepoolFormValues) => void
    getStepper?: (activeStep: number) => StepProps[]
    availableFarms?: ReactNode
    relatedAToken: TErc20
  },
) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const refetchPositions = useRefetchAccountAssets()
  const form = useFormContext<TAddStablepoolFormValues>()
  const { getAssetWithFallback } = useAssets()

  const {
    asset,
    isJoinFarms,
    availableFarms,
    balancesMax,
    relatedAToken,
    pool: { reserves, poolId },
    onClose,
    onAssetOpen,
    onJoinOmnipool,
    setLiquidityLimit,
    getStepper,
  } = props

  const {
    formState: { errors },
    getValues,
    setValue,
    trigger,
    watch,
    control,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const [debouncedValue = "0"] = useDebouncedValue(
    watch("reserves")[0].amount,
    300,
  )

  const { getSwapTx } = useBestTradeSell(
    asset.id,
    relatedAToken.id,
    debouncedValue,
    (minAmount) => {
      setValue(
        "amount",
        scaleHuman(minAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
      )
      trigger()
    },
  )

  const hfChange = useHealthFactorChange({
    assetId: asset.id,
    amount: debouncedValue,
    action: ProtocolAction.withdraw,
  })

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    const tx = await getSwapTx()

    await createTransaction(
      {
        tx,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        toast: addStablepoolToast(values.reserves, getAssetWithFallback),
        disableAutoClose: !!onJoinOmnipool,
        steps: getStepper?.(0),
      },
    )

    await onJoinOmnipool?.(values)
  }

  const onInvalidSubmit = (errors: FieldErrors<TAddStablepoolFormValues>) => {
    const { farms, ...blockingErrors } = errors

    if (!isJoinFarms && !Object.keys(blockingErrors).length) {
      onSubmit(getValues())
    }
  }

  const isSubmitDisabled =
    !!errors.amount ||
    !!errors.reserves ||
    (!!hfChange?.isHealthFactorBelowThreshold && !healthFactorRiskAccepted)

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
      autoComplete="off"
    >
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
                      amount: v,
                      decimals: field.decimals,
                    })
                  }
                  balance={BN(balanceMax)}
                  balanceMax={BN(balanceMax)}
                  asset={value.assetId}
                  error={error?.message ?? errors.amount?.message}
                  onAssetOpen={onAssetOpen}
                />
              )}
            />
          )
        })}
      </div>

      <Spacer size={20} />

      <LiquidityLimitField setLiquidityLimit={setLiquidityLimit} />

      <StablepoolFeeSummaryRow poolId={poolId} />

      {availableFarms}

      <Spacer size={20} />
      <CurrencyReserves reserves={reserves} />
      <Spacer size={20} />
      <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
        {t("liquidity.add.modal.positionDetails")}
      </Text>

      <SummaryRow
        label={t("liquidity.stablepool.add.minimalReceived")}
        content={t("value.tokenWithSymbol", {
          value: BN(watch("amount")),
          symbol: relatedAToken.name,
        })}
        withSeparator
      />

      <ATokenPriceField selectedAsset={asset} aToken={relatedAToken} />

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
            sx={{ mb: 16 }}
          />
        </>
      )}
      {Array.isArray(errors.amount)
        ? errors.amount.map((e, i) => (
            <Alert key={i} variant="warning" css={{ marginBottom: 8 }}>
              {e.message}
            </Alert>
          ))
        : null}
      <Spacer size={20} />
      <PoolAddLiquidityInformationCard />
      <Spacer size={20} />

      <Alert variant="info">
        <Text fs={13} lh={16}>
          {t("liquidity.add.modal.trade.alert", {
            symbol: relatedAToken.symbol,
          })}
        </Text>
      </Alert>

      <Separator
        color="darkBlue401"
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          mb: 20,
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

export const SplitMoneyMarketStablepoolForm = (
  props: AddMoneyMarketStablepoolProps & {
    balancesMax: TTransferableBalance[]
    onJoinOmnipool?: (values: TAddStablepoolFormValues) => void
    availableFarms?: ReactNode
    relatedAToken: TErc20
    onSubmit: (values: TAddStablepoolFormValues) => Promise<void>
  },
) => {
  const { t } = useTranslation()
  const form = useFormContext<TAddStablepoolFormValues>()

  const {
    onSubmit,
    setLiquidityLimit,
    isJoinFarms,
    availableFarms,
    balancesMax,
    pool: { poolId, reserves },
    relatedAToken,
  } = props

  const {
    formState: { errors },
    getValues,
    setValue,
    trigger,
    watch,
    control,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const { getShares } = useStablepoolShares(props.pool)

  const getStablepoolShares = () => {
    const shares = getShares(getValues("reserves"))

    if (shares) {
      setValue("amount", shares, { shouldValidate: true })
      trigger()
    }
  }

  const onInvalidSubmit = (errors: FieldErrors<TAddStablepoolFormValues>) => {
    const { farms, ...blockingErrors } = errors

    if (!isJoinFarms && !Object.keys(blockingErrors).length) {
      onSubmit(getValues())
    }
  }

  const isSubmitDisabled = !!errors.amount || !!errors.reserves

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
      autoComplete="off"
    >
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
                  onChange={(v) => {
                    onChange({
                      assetId: field.assetId,
                      decimals: field.decimals,
                      amount: v,
                    })
                    getStablepoolShares()
                  }}
                  balance={BN(balanceMax)}
                  balanceMax={BN(balanceMax)}
                  asset={value.assetId}
                  error={error?.message ?? errors.amount?.message}
                />
              )}
            />
          )
        })}
      </div>

      <Spacer size={20} />

      <LiquidityLimitField setLiquidityLimit={setLiquidityLimit} />

      <StablepoolFeeSummaryRow poolId={poolId} />

      {availableFarms}

      <Spacer size={20} />

      <CurrencyReserves reserves={reserves} />

      <Spacer size={20} />

      <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
        {t("liquidity.add.modal.positionDetails")}
      </Text>

      <SummaryRow
        label={t("liquidity.stablepool.add.minimalReceived")}
        withSeparator
        content={t("value.tokenWithSymbol", {
          value: BN(watch("amount")),
          symbol: relatedAToken.name,
        })}
      />

      {Array.isArray(errors.amount)
        ? errors.amount.map((e, i) => (
            <Alert key={i} variant="warning" css={{ marginBottom: 8 }}>
              {e.message}
            </Alert>
          ))
        : null}

      <Spacer size={20} />

      <PoolAddLiquidityInformationCard />

      <Spacer size={20} />

      <Alert variant="info">
        <Text fs={13} lh={16}>
          {t("liquidity.add.modal.trade.alert", {
            symbol: relatedAToken.symbol,
          })}
        </Text>
      </Alert>

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

const ATokenPriceField = ({
  selectedAsset,
  aToken,
}: {
  selectedAsset: TAsset
  aToken: TErc20
}) => {
  const { t } = useTranslation()
  const { data: spotPrice } = useSpotPrice(aToken.id, selectedAsset.id)

  return (
    <SummaryRow
      label={t("liquidity.remove.modal.price")}
      withSeparator
      content={
        <Text fs={14} color="white" tAlign="right">
          <Trans
            t={t}
            i18nKey="liquidity.add.modal.row.spotPrice"
            tOptions={{
              firstAmount: 1,
              firstCurrency: aToken.symbol,
            }}
          >
            {t("value.tokenWithSymbol", {
              value: spotPrice?.spotPrice.toString(),
              symbol: selectedAsset.symbol,
            })}
          </Trans>
        </Text>
      }
    />
  )
}
