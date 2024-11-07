import { Controller, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { Summary } from "components/Summary/Summary"
import { Trans, useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
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
import { useAssets } from "providers/assets"
import { JoinFarmsSection } from "./components/JoinFarmsSection/JoinFarmsSection"
import { useRefetchAccountAssets } from "api/deposits"

type Props = {
  assetId: string
  initialAmount?: string
  onClose: () => void
  onAssetOpen?: () => void
  onSuccess?: (result: ISubmittableResult, value: string) => void
  farms: TFarmAprData[]
}

export const AddLiquidityForm = ({
  assetId,
  onClose,
  onAssetOpen,
  onSuccess,
  initialAmount,
  farms,
}: Props) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { native } = useAssets()
  const { createTransaction } = useStore()
  const isFarms = farms.length > 0
  const [isJoinFarms, setIsJoinFarms] = useState(isFarms)
  const refetchAccountAssets = useRefetchAccountAssets()

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

  const { poolShare, spotPrice, omnipoolFee, assetMeta, assetBalance } =
    useAddLiquidity(assetId, debouncedAmount)

  const estimatedFees = useEstimatedFees(
    getAddToOmnipoolFee(api, isJoinFarms, farms),
  )

  const balance = assetBalance?.balance ?? BN_0
  const balanceMax =
    estimatedFees.accountCurrencyId === assetMeta.id
      ? balance
          .minus(estimatedFees.accountCurrencyFee)
          .minus(assetMeta.existentialDeposit)
      : balance

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.decimals == null) throw new Error("Missing asset meta")

    const amount = scale(values.amount, assetMeta.decimals).toString()

    return await createTransaction(
      {
        tx: isJoinFarms
          ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
              farms.map((farm) => [farm.globalFarmId, farm.yieldFarmId]),
              assetId,
              amount,
            )
          : api.tx.omnipool.addLiquidity(assetId, amount),
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
        toast: createToastMessages("liquidity.add.modal.toast", {
          t,
          tOptions: {
            value: values.amount,
            symbol: assetMeta?.symbol,
            where: "Omnipool",
          },
          components: ["span", "span.highlight"],
        }),
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

  const isJoinFarmDisabled = !!customErrors?.farm
  const isSubmitDisabled = isJoinFarms
    ? !!Object.keys(formState.errors).length
    : !!Object.keys(formState.errors.amount ?? {}).filter(
        (key) => key !== "farm",
      ).length

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
      onSubmit={handleSubmit(onSubmit)}
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
              balance={balance}
              balanceMax={balanceMax}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <Spacer size={20} />
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
                      firstCurrency: assetMeta?.symbol,
                    }}
                  >
                    <DisplayValue value={spotPrice?.spotPrice} />
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
                    value: BigNumber(0.01),
                  }),
            },
          ]}
        />
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
      <Button variant="primary" disabled={isSubmitDisabled}>
        {isJoinFarms
          ? t("liquidity.add.modal.button.joinFarms")
          : t("liquidity.add.modal.confirmButton")}
      </Button>
    </form>
  )
}
