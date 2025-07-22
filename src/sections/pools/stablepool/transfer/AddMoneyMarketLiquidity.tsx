import {
  AAVE_EXTRA_GAS,
  BN_100,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_ERC20_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  STABLEPOOL_TOKEN_DECIMALS,
} from "utils/constants"

import { ReactNode, useState } from "react"
import {
  Controller,
  FieldErrors,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form"
import { useBestTradeSell } from "api/trade"
import { scaleHuman } from "utils/balance"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useHealthFactorChange } from "api/borrow"
import { ProtocolAction } from "@aave/contract-helpers"
import { useAddToOmnipoolZod } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { maxBalance, required } from "utils/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trans, useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { useRefetchAccountAssets } from "api/deposits"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import BN from "bignumber.js"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useLiquidityLimit } from "state/liquidityLimit"
import {
  AddStablepoolProps,
  createFormSchema,
  TAddStablepoolFormValues,
  TTransferableBalance,
  useAddStablepoolForm,
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
import { Summary } from "components/Summary/Summary"
import { useSpotPrice } from "api/spotPrice"
import { useAssets } from "providers/assets"
import { AvailableFarmsForm } from "sections/pools/modals/AddLiquidity/components/JoinFarmsSection/JoinFarmsSection"
import { PriceField } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"

////// provide liq + buy erc 20 + move to omnipool
// hollar: provide liq + buy erc 20

const MOMEY_MARKET_ERC20_MAP: Record<string, string> = {
  [GDOT_STABLESWAP_ASSET_ID]: GDOT_ERC20_ASSET_ID,
  [GETH_STABLESWAP_ASSET_ID]: GETH_ERC20_ASSET_ID,
}

export const AddSplitMoneyMarketStablepool = (props: AddStablepoolProps) => {
  const { initialAmounts, asset } = props

  const { balancesMax } = useSplitMoneyMarketStablepoolSubmitHandler(props)
  const form = useAddStablepoolForm(props, createFormSchema(balancesMax))

  return (
    <FormProvider {...form}>
      <SplitMoneyMarketStablepoolForm balancesMax={balancesMax} {...props} />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepool = (props: AddStablepoolProps) => {
  const { initialAmounts, asset } = props

  const resolver = createFormSchema(transferableWalletBalance, asset.decimals)

  const form = useForm<TAddStablepoolFormValues>({
    mode: "onChange",
    defaultValues: { reserves: initialAmounts, amount: "", farms: false },
    resolver: zodResolver(resolver),
  })

  return (
    <FormProvider {...form}>
      <AddMoneyMarketLiquidity {...props} />
    </FormProvider>
  )
}

export const AddMoneyMarketStablepoolOmnipool = (props: AddStablepoolProps) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api, sdk } = useRpcProvider()
  const { addLiquidityLimit } = useLiquidityLimit()
  const { createTransaction } = useStore()
  const refetchPositions = useRefetchAccountAssets()

  const {
    onClose,
    initialAmount,
    transferableWalletBalance,
    asset,
    isJoinFarms,
    setIsJoinFarms,
    pool: { id, poolId, farms, symbol },
  } = props

  const omnipoolZod = useAddToOmnipoolZod(
    id,
    required.pipe(maxBalance(transferableWalletBalance, asset.decimals)),
  )

  const form = useForm<TAddStablepoolFormValues>({
    mode: "onChange",
    defaultValues: { value: initialAmount, farms: true },
    resolver: omnipoolZod ? zodResolver(omnipoolZod) : undefined,
  })

  const onJoinOmnipool = async (values: TAddStablepoolFormValues) => {
    const omnipoolAssetId = MOMEY_MARKET_ERC20_MAP[poolId]
    const initialBalance = transferableWalletBalance
    const secondStepperLabel = t(
      `liquidity.add.modal.geth.stepper.second${isJoinFarms ? ".joinFarms" : ""}`,
    )
    const toast = createToastMessages(
      `liquidity.add.modal.${isJoinFarms ? "andJoinFarms." : ""}toast`,
      {
        t,
        tOptions: {
          value: BN(values.amount),
          symbol,
          where: "Omnipool",
        },
        components: ["span", "span.highlight"],
      },
    )

    const balanceApi = (
      await sdk.client.balance.getBalance(
        account?.address ?? "",
        omnipoolAssetId,
      )
    ).toString()

    const diffBalance = BN(balanceApi).minus(initialBalance).toString()

    const limitShares = BN(diffBalance)
      .times(BN_100.minus(addLiquidityLimit).div(BN_100))
      .toFixed(0)

    const secondTx = api.tx.dispatcher.dispatchWithExtraGas(
      isJoinFarms
        ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
            farms.map<[string, string]>((farm) => [
              farm.globalFarmId,
              farm.yieldFarmId,
            ]),
            omnipoolAssetId,
            diffBalance,
            limitShares,
          )
        : api.tx.omnipool.addLiquidityWithLimit(
            omnipoolAssetId,
            diffBalance,
            limitShares,
          ),
      AAVE_EXTRA_GAS,
    )

    await createTransaction(
      {
        tx: secondTx,
        title: secondStepperLabel,
      },
      {
        onSuccess: refetchPositions,
        onSubmitted: onClose,
        onError: onClose,
        onClose,
        onBack: () => {},
        steps: [
          {
            label: t("liquidity.add.modal.geth.stepper.first"),
            state: "done",
          },
          {
            label: secondStepperLabel,
            state: "active",
          },
        ],
        toast,
      },
    )
  }

  return (
    <FormProvider {...form}>
      <AddMoneyMarketLiquidity
        onJoinOmnipool={onJoinOmnipool}
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

export const SplitMoneyMarketStablepoolForm = (
  props: AddStablepoolProps & {
    balancesMax: TTransferableBalance[]
    onJoinOmnipool?: (values: TAddStablepoolFormValues) => void
    availableFarms?: ReactNode
  },
) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const refetchPositions = useRefetchAccountAssets()
  const form = useFormContext<TAddStablepoolFormValues>()
  const { getAssetWithFallback } = useAssets()

  const {
    onClose,
    onAssetOpen,
    asset,
    onJoinOmnipool,
    isJoinFarms,
    split,
    availableFarms,
    balancesMax,
    pool: { poolId, reserves },
  } = props

  const {
    formState: { errors },
    getValues,
    setValue,
    trigger,
    control,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const aTokenId = MOMEY_MARKET_ERC20_MAP[poolId]
  const aTokenMeta = getAssetWithFallback(aTokenId)

  const stablepoolShares = form.watch("amount")

  const [debouncedShares] = useDebouncedValue(stablepoolShares, 300)
  const { data: spotPrice } = useSpotPrice(aTokenId, asset.id)

  const { getShares } = useStablepoolShares({
    poolId,
    reserves,
  })

  const getStablepoolShares = () => {
    const shares = getShares(getValues("reserves"))

    if (shares) {
      setValue("amount", shares)
      trigger()
    }
  }

  const { getSwapTx } = useBestTradeSell(
    asset.id,
    MOMEY_MARKET_ERC20_MAP[poolId],
    debouncedShares ?? "0",
    (minAmount) => {
      if (debouncedShares) {
        form.setValue(
          "amount",
          scaleHuman(minAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
        )
        trigger()
      }
    },
  )

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    const tx = await getSwapTx()

    const toast = createToastMessages("liquidity.add.modal.toast", {
      t,
      tOptions: {
        value: values.value,
        symbol: asset.symbol,
        where: "Stablepool",
      },
      components: ["span", "span.highlight"],
    })

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
        toast,
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
                    onChange({ assetId: field.assetId, amount: v })
                    //getStablepoolShares()
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

      <Separator
        color="darkBlue401"
        sx={{
          my: 4,
          width: "auto",
        }}
      />

      {availableFarms}

      <Spacer size={20} />
      <CurrencyReserves reserves={reserves} />
      <Spacer size={20} />
      <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
        {t("liquidity.add.modal.positionDetails")}
      </Text>

      {!split && <PriceField asset={asset} />}

      <Summary
        rows={[
          {
            label: t("liquidity.stablepool.add.minimalReceived"),
            content: t("value.tokenWithSymbol", {
              value: BN(shares),
              type: "token",
              symbol: aTokenMeta.name,
            }),
          },
        ]}
      />

      {!split && (
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
                  firstCurrency: aTokenMeta.symbol,
                }}
              >
                {t("value.tokenWithSymbol", {
                  value: spotPrice?.spotPrice.toString(),
                  symbol: asset.symbol,
                })}
              </Trans>
            </Text>
          }
        />
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

export const MoneyMarketStablepoolForm = (
  props: AddStablepoolProps & {
    balancesMax: TTransferableBalance[]
    onJoinOmnipool?: (values: TAddStablepoolFormValues) => void
    availableFarms?: ReactNode
  },
) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const refetchPositions = useRefetchAccountAssets()
  const form = useFormContext<TAddStablepoolFormValues>()
  const { getAssetWithFallback } = useAssets()

  const {
    onClose,
    onAssetOpen,
    asset,
    onJoinOmnipool,
    isJoinFarms,
    split,
    availableFarms,
    balancesMax,
    pool: { poolId, reserves },
  } = props

  const {
    formState: { errors },
    getValues,
    setValue,
    trigger,
    control,
  } = form

  const { fields } = useFieldArray({
    control,
    name: "reserves",
  })

  const aTokenId = MOMEY_MARKET_ERC20_MAP[poolId]
  const aTokenMeta = getAssetWithFallback(aTokenId)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const shares = form.watch("amount")
  const value = form.watch("value")

  const [debouncedValue] = useDebouncedValue(value, 300)
  const { data: spotPrice } = useSpotPrice(aTokenId, asset.id)

  const { getSwapTx } = useBestTradeSell(
    asset.id,
    MOMEY_MARKET_ERC20_MAP[poolId],
    debouncedValue ?? "0",
    (minAmount) => {
      if (debouncedValue) {
        form.setValue(
          "amount",
          scaleHuman(minAmount, STABLEPOOL_TOKEN_DECIMALS).toString(),
        )
        trigger()
      }
    },
  )

  const hfChange = useHealthFactorChange({
    assetId: asset.id,
    amount: debouncedValue,
    action: ProtocolAction.withdraw,
  })

  const onSubmit = async (values: TAddStablepoolFormValues) => {
    const tx = await getSwapTx()

    const toast = createToastMessages("liquidity.add.modal.toast", {
      t,
      tOptions: {
        value: values.value,
        symbol: asset.symbol,
        where: "Stablepool",
      },
      components: ["span", "span.highlight"],
    })

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
        toast,
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

  const isSubmitDisabled = !!errors.amount || !!errors.value
  const isHFDisabled =
    !!hfChange?.isHealthFactorBelowThreshold && !healthFactorRiskAccepted

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
                    onChange({ assetId: field.assetId, amount: v })
                    //getStablepoolShares()
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

      <Separator
        color="darkBlue401"
        sx={{
          my: 4,
          width: "auto",
        }}
      />

      {availableFarms}

      <Spacer size={20} />
      <CurrencyReserves reserves={reserves} />
      <Spacer size={20} />
      <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
        {t("liquidity.add.modal.positionDetails")}
      </Text>

      {!split && <PriceField asset={asset} />}

      <Summary
        rows={[
          {
            label: t("liquidity.stablepool.add.minimalReceived"),
            content: t("value.tokenWithSymbol", {
              value: BN(shares),
              type: "token",
              symbol: aTokenMeta.name,
            }),
          },
        ]}
      />

      {!split && (
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
                  firstCurrency: aTokenMeta.symbol,
                }}
              >
                {t("value.tokenWithSymbol", {
                  value: spotPrice?.spotPrice.toString(),
                  symbol: asset.symbol,
                })}
              </Trans>
            </Text>
          }
        />
      )}

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

      <Separator
        color="darkBlue401"
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          mb: 20,
          width: "auto",
        }}
      />
      <Button
        variant="primary"
        fullWidth
        disabled={isSubmitDisabled || isHFDisabled}
      >
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}
