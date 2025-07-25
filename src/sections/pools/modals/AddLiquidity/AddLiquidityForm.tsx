import { Controller, FieldErrors, useForm } from "react-hook-form"
import BN from "bignumber.js"
import { AAVE_EXTRA_GAS, BN_100 } from "utils/constants"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { Summary } from "components/Summary/Summary"
import { Trans, useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { Button, ButtonTransparent } from "components/Button/Button"
import { FormValues } from "utils/helpers"
import { scale } from "utils/balance"
import {
  getAddToOmnipoolFee,
  useAddLiquidity,
  useAddToOmnipoolZod,
} from "./AddLiquidity.utils"
import { useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { useEstimatedFees } from "api/transaction"
import { TFarmAprData } from "api/farms"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert } from "components/Alert/Alert"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { createToastMessages } from "state/toasts"
import { ISubmittableResult } from "@polkadot/types/types"
import { useEffect, useState } from "react"
import { TAsset, useAssets } from "providers/assets"
import { JoinFarmsSection } from "./components/JoinFarmsSection/JoinFarmsSection"
import { useRefetchAccountAssets } from "api/deposits"
import { useLiquidityLimit } from "state/liquidityLimit"
import { useAssetsPrice } from "state/displayPrice"
import { useHealthFactorChange, useMaxWithdrawAmount } from "api/borrow"
import { ProtocolAction } from "@aave/contract-helpers"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { HealthFactorChange } from "sections/lending/components/HealthFactorChange"

type Props = {
  assetId: string
  initialAmount?: string
  onClose: () => void
  onAssetOpen?: () => void
  onSuccess?: (result: ISubmittableResult, value: string) => void
  farms: TFarmAprData[]
  setLiquidityLimit: () => void
}

export const AddLiquidityForm = ({
  assetId,
  onClose,
  onAssetOpen,
  onSuccess,
  initialAmount,
  farms,
  setLiquidityLimit,
}: Props) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { native } = useAssets()
  const { createTransaction } = useStore()
  const isFarms = farms.length > 0
  const [isJoinFarms, setIsJoinFarms] = useState(isFarms)
  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const refetchAccountAssets = useRefetchAccountAssets()
  const { addLiquidityLimit } = useLiquidityLimit()

  const zodSchema = useAddToOmnipoolZod(assetId, farms)
  const form = useForm<{
    amount: string
  }>({
    mode: "onChange",
    defaultValues: { amount: initialAmount },
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  })

  const { handleSubmit, watch, reset, control, formState } = form

  const [debouncedAmount] = useDebouncedValue(watch("amount"), 300)

  const {
    totalShares,
    omnipoolFee,
    assetMeta,
    assetBalance,
    sharesToGet,
    isGETH,
  } = useAddLiquidity(assetId, debouncedAmount)

  const hfChange = useHealthFactorChange({
    assetId,
    amount: debouncedAmount,
    action: ProtocolAction.withdraw,
  })

  const maxBalanceToWithdraw = useMaxWithdrawAmount(assetId)

  const estimatedFees = useEstimatedFees(
    getAddToOmnipoolFee(api, isJoinFarms, farms),
  )

  const balance = assetBalance?.transferable ?? "0"
  const balanceMax = isGETH
    ? BN.min(
        BN(maxBalanceToWithdraw).shiftedBy(assetMeta.decimals),
        balance,
      ).toString()
    : estimatedFees.accountCurrencyId === assetMeta.id
      ? BN(balance)
          .minus(estimatedFees.accountCurrencyFee)
          .minus(assetMeta.existentialDeposit)
          .toString()
      : balance

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.decimals == null) throw new Error("Missing asset meta")

    const amount = scale(values.amount, assetMeta.decimals).toString()
    const shares = sharesToGet
      .times(BN_100.minus(addLiquidityLimit).div(BN_100))
      .toFixed(0)

    const tx = isJoinFarms
      ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
          farms.map<[string, string]>((farm) => [
            farm.globalFarmId,
            farm.yieldFarmId,
          ]),
          assetId,
          amount,
          shares,
        )
      : api.tx.omnipool.addLiquidityWithLimit(assetId, amount, shares)

    return await createTransaction(
      {
        tx: isGETH
          ? api.tx.dispatcher.dispatchWithExtraGas(
              tx.inner.toHex(),
              AAVE_EXTRA_GAS,
            )
          : tx,
      },
      {
        onSuccess: (result) => {
          refetchAccountAssets()
          onSuccess?.(result, amount)
        },
        onSubmitted: () => {
          onClose()
          reset()
        },
        onClose,
        onBack: () => {},
        toast: createToastMessages(
          `liquidity.add.modal.${isJoinFarms ? "andJoinFarms." : ""}toast`,
          {
            t,
            tOptions: {
              value: BN(values.amount),
              symbol: assetMeta?.symbol,
              where: "Omnipool",
            },
            components: ["span", "span.highlight"],
          },
        ),
        onError: onClose,
      },
    )
  }

  const customErrors = formState.errors.amount as unknown as
    | {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      }
    | undefined

  const onInvalidSubmit = (errors: FieldErrors<FormValues<typeof form>>) => {
    if (
      !isJoinFarms &&
      (errors.amount as { farm?: { message: string } }).farm
    ) {
      onSubmit(form.getValues())
    }
  }

  const isJoinFarmDisabled = !!customErrors?.farm
  const isSubmitDisabled = isJoinFarms
    ? !!Object.keys(formState.errors).length
    : !!Object.keys(formState.errors.amount ?? {}).filter(
        (key) => key !== "farm",
      ).length

  const isHFDisabled = isGETH
    ? !!hfChange?.isHealthFactorBelowThreshold && !healthFactorRiskAccepted
    : false

  useEffect(() => {
    if (!isFarms) return
    if (isJoinFarmDisabled) {
      setIsJoinFarms(false)
    } else {
      setIsJoinFarms(true)
    }
  }, [isFarms, isJoinFarmDisabled, setIsJoinFarms])

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column" }}>
        <Controller
          name="amount"
          control={control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onBlur={onChange}
              onChange={onChange}
              asset={assetId}
              balance={BN(balanceMax)}
              balanceMax={BN(balanceMax)}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <Spacer size={20} />
        <SummaryRow
          label={t("liquidity.add.modal.tradeLimit")}
          content={
            <div sx={{ flex: "row", align: "baseline", gap: 4 }}>
              <Text fs={14} color="white" tAlign="right">
                {t("value.percentage", { value: addLiquidityLimit })}
              </Text>
              <ButtonTransparent onClick={() => setLiquidityLimit()}>
                <Text color="brightBlue200" fs={14}>
                  {t("edit")}
                </Text>
              </ButtonTransparent>
            </div>
          }
        />
        <Separator
          color="darkBlue401"
          sx={{
            my: 4,
            width: "auto",
          }}
        />
        <SummaryRow
          label={t("liquidity.add.modal.tradeFee")}
          description={t("liquidity.add.modal.tradeFee.description")}
          content={
            assetId === native.id
              ? "--"
              : t("value.percentage.range", {
                  from: omnipoolFee?.minFee.multipliedBy(100),
                  to: omnipoolFee?.maxFee.multipliedBy(100),
                })
          }
        />
        <Separator
          color="darkBlue401"
          sx={{
            my: 4,
            width: "auto",
          }}
        />
        {farms.length > 0 ? (
          <JoinFarmsSection
            farms={farms}
            isJoinFarms={isJoinFarms}
            setIsJoinFarms={setIsJoinFarms}
            error={customErrors?.farm?.message}
            isJoinFarmDisabled={isJoinFarmDisabled}
          />
        ) : null}
        <Spacer size={20} />
        <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>

        <AddOmnipoolLiquiditySummary
          asset={assetMeta}
          sharesToGet={sharesToGet.toString()}
          totalShares={totalShares.toString()}
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
              sx={{ mb: 16 }}
            />
          </>
        )}

        <Text color="warningOrange200" fs={14} fw={400} sx={{ my: 20 }}>
          {t("liquidity.add.modal.warning")}
        </Text>

        {customErrors?.cap ? (
          <Alert variant="warning" css={{ marginBottom: 8 }}>
            {customErrors.cap.message}
          </Alert>
        ) : null}
        {customErrors?.circuitBreaker ? (
          <Alert variant="warning" css={{ marginBottom: 8 }}>
            {customErrors.circuitBreaker.message}
          </Alert>
        ) : null}
        <PoolAddLiquidityInformationCard />
        <Spacer size={20} />
      </div>
      <Separator
        color="darkBlue401"
        sx={{
          mx: "calc(-1 * var(--modal-content-padding))",
          mb: 20,
          width: "auto",
        }}
      />
      <Button variant="primary" disabled={isSubmitDisabled || isHFDisabled}>
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}

export const AddOmnipoolLiquiditySummary = ({
  asset,
  totalShares,
  sharesToGet,
}: {
  asset: TAsset
  totalShares: string
  sharesToGet: string
}) => {
  const { t } = useTranslation()

  const { getAssetPrice } = useAssetsPrice([asset.id])

  const poolShare = BN(sharesToGet)
    .div(BN(totalShares).plus(sharesToGet))
    .times(100)

  return (
    <Summary
      rows={[
        {
          label: t("liquidity.remove.modal.price"),
          content: (
            <Text fs={14} color="white" tAlign="right">
              <Trans
                t={t}
                i18nKey="liquidity.add.modal.row.spotPrice"
                tOptions={{
                  firstAmount: 1,
                  firstCurrency: asset.symbol,
                }}
              >
                <DisplayValue value={BN(getAssetPrice(asset.id).price)} />
              </Trans>
            </Text>
          ),
        },
        {
          label: t("liquidity.add.modal.shareOfPool"),
          content: poolShare?.gte(0.01)
            ? t("value.percentage", {
                value: poolShare,
              })
            : t("value.percentage", {
                numberPrefix: "<",
                value: BN(0.01),
              }),
        },
      ]}
    />
  )
}
