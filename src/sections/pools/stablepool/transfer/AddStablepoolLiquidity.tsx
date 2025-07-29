import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import {
  Controller,
  FieldErrors,
  FormProvider,
  useFieldArray,
  useFormContext,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import {
  AddStablepoolProps,
  AddStablepoolWrapperProps,
  getReservesZodSchema,
  stablepoolZodSchema,
  TAddStablepoolFormValues,
  TTransferableBalance,
  useAddStablepoolForm,
  useStablepoolShares,
  useStablepoolSubmitHandler,
} from "./AddStablepoolLiquidity.utils"
import { CurrencyReserves } from "sections/pools/stablepool/components/CurrencyReserves"
import { GETH_ERC20_ASSET_ID } from "utils/constants"
import { useAddToOmnipoolZod } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { Alert } from "components/Alert/Alert"
import { ReactNode } from "react"
import { useAccountBalances } from "api/deposits"
import { AvailableFarmsForm } from "sections/pools/modals/AddLiquidity/components/JoinFarmsSection/JoinFarmsSection"
import {
  AddLiquidityForm,
  LiquidityLimitField,
  PriceField,
} from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import {
  AddMoneyMarketStablepool,
  AddMoneyMarketStablepoolOmnipool,
  AddSplitMoneyMarketStablepool,
  AddSplitMoneyMarketStablepoolOmnipool,
} from "./AddMoneyMarketLiquidity"
import { StablepoolFeeSummaryRow } from "sections/pools/stablepool/components/StablepoolFeeSummaryRow"

export const AddStablepoolLiquidityWrapper = (
  props: AddStablepoolWrapperProps,
) => {
  const { data: accountBalances } = useAccountBalances()

  const {
    initialAmount,
    split,
    onAssetOpen,
    setLiquidityLimit,
    isStablepoolOnly,
    pool: { isGETH, farms, reserves, relatedAToken },
    asset: { id: selectedAssetId, decimals },
  } = props

  const isMoveGETHToOmnipool = isGETH && selectedAssetId === GETH_ERC20_ASSET_ID

  const initialAmounts = split
    ? reserves.map((reserve) => ({
        assetId: reserve.asset_id.toString(),
        decimals: reserve.decimals,
        amount: "",
      }))
    : [{ assetId: selectedAssetId, decimals, amount: initialAmount ?? "" }]

  const transferableBalances = initialAmounts.map(({ assetId, decimals }) => ({
    assetId,
    decimals,
    balance:
      accountBalances?.accountAssetsMap.get(assetId)?.balance?.transferable ??
      "0",
  }))

  if (isMoveGETHToOmnipool && !split) {
    return (
      <AddLiquidityForm
        assetId={selectedAssetId}
        farms={farms}
        onClose={props.onClose}
        setLiquidityLimit={setLiquidityLimit}
        onAssetOpen={onAssetOpen}
      />
    )
  }

  if (relatedAToken) {
    if (split)
      return isStablepoolOnly ? (
        <AddSplitMoneyMarketStablepool
          transferableBalances={transferableBalances}
          initialAmounts={initialAmounts}
          {...props}
          relatedAToken={relatedAToken}
        />
      ) : (
        <AddSplitMoneyMarketStablepoolOmnipool
          transferableBalances={transferableBalances}
          initialAmounts={initialAmounts}
          {...props}
          relatedAToken={relatedAToken}
        />
      )

    return isStablepoolOnly ? (
      <AddMoneyMarketStablepool
        transferableBalances={transferableBalances}
        initialAmounts={initialAmounts}
        {...props}
        relatedAToken={relatedAToken}
      />
    ) : (
      <AddMoneyMarketStablepoolOmnipool
        transferableBalances={transferableBalances}
        initialAmounts={initialAmounts}
        {...props}
        relatedAToken={relatedAToken}
      />
    )
  }

  return isStablepoolOnly ? (
    <StablepoolOnly
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  ) : (
    <StablepoolOmnipool
      transferableBalances={transferableBalances}
      initialAmounts={initialAmounts}
      {...props}
    />
  )
}

const StablepoolOnly = (props: AddStablepoolProps) => {
  const { balancesMax, onSubmit } = useStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(props, stablepoolZodSchema(balancesMax))

  return (
    <FormProvider {...form}>
      <StablepoolForm
        balancesMax={balancesMax}
        onSubmit={onSubmit}
        {...props}
      />
    </FormProvider>
  )
}

const StablepoolOmnipool = (props: AddStablepoolProps) => {
  const {
    isJoinFarms,
    setIsJoinFarms,
    pool: { poolId, farms },
  } = props

  const { balancesMax, onSubmit } = useStablepoolSubmitHandler(props)

  const form = useAddStablepoolForm(
    props,
    useAddToOmnipoolZod(poolId, getReservesZodSchema(balancesMax)),
  )

  return (
    <FormProvider {...form}>
      <StablepoolForm
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

const StablepoolForm = (
  props: AddStablepoolProps & {
    balancesMax: TTransferableBalance[]
    onSubmit: (values: TAddStablepoolFormValues) => void
    availableFarms?: ReactNode
  },
) => {
  const { t } = useTranslation()
  const form = useFormContext<TAddStablepoolFormValues>()

  const {
    split,
    onAssetOpen,
    onSubmit,
    setLiquidityLimit,
    asset,
    isJoinFarms,
    balancesMax,
    availableFarms,
    pool: { reserves, poolId },
  } = props

  const {
    control,
    formState: { errors },
    setValue,
    trigger,
    watch,
    getValues,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const stablepoolShares = watch("amount")

  const { getShares } = useStablepoolShares(props.pool)

  const getStablepoolShares = () => {
    const shares = getShares(getValues("reserves"))

    if (shares) {
      setValue("amount", shares)
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
              control={form.control}
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
                      amount: v,
                      decimals: field.decimals,
                    })
                    getStablepoolShares()
                  }}
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

      <StablepoolFeeSummaryRow poolId={poolId} />

      {availableFarms}

      <Spacer size={20} />
      <CurrencyReserves reserves={reserves} />
      <Spacer size={20} />
      <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
        {t("liquidity.add.modal.positionDetails")}
      </Text>

      <SummaryRow
        label={t("liquidity.add.modal.shareTokens")}
        withSeparator
        content={t("value", {
          value: stablepoolShares,
          type: "token",
        })}
      />

      {!split && <PriceField asset={asset} />}

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
      <Button variant="primary" fullWidth disabled={isSubmitDisabled}>
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}
