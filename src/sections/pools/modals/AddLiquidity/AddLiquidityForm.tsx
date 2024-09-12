import { Controller, FieldErrors, useForm } from "react-hook-form"
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
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { useEstimatedFees } from "api/transaction"
import { Farm } from "api/farms"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert } from "components/Alert/Alert"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { TOAST_MESSAGES } from "state/toasts"
import { ISubmittableResult } from "@polkadot/types/types"
import { BaseSyntheticEvent } from "react"
import { useAssets } from "providers/assets"

type Props = {
  assetId: string
  initialAmount?: string
  onClose: () => void
  onAssetOpen?: () => void
  onSubmitted?: () => void
  onSuccess: (result: ISubmittableResult, value: string) => void
  farms: Farm[]
  setIsJoinFarms: (value: boolean) => void
}

export const AddLiquidityForm = ({
  assetId,
  onClose,
  onAssetOpen,
  onSubmitted,
  onSuccess,
  initialAmount,
  farms,
  setIsJoinFarms,
}: Props) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { native } = useAssets()
  const { createTransaction } = useStore()

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

  const estimatedFees = useEstimatedFees(getAddToOmnipoolFee(api, farms))

  const balance = assetBalance?.balance ?? BN_0
  const balanceMax =
    estimatedFees.accountCurrencyId === assetMeta.id
      ? balance
          .minus(estimatedFees.accountCurrencyFee)
          .minus(assetMeta.existentialDeposit)
      : balance

  const onSubmit = async (
    values: FormValues<typeof form>,
    e?: BaseSyntheticEvent,
  ) => {
    if (assetMeta.decimals == null) throw new Error("Missing asset meta")

    const submitAction = (e?.nativeEvent as SubmitEvent)
      ?.submitter as HTMLButtonElement

    const isJoinFarms = submitAction?.name === "joinFarms"

    const amount = scale(values.amount, assetMeta.decimals).toString()

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`liquidity.add.modal.toast.${msType}`}
          tOptions={{
            value: values.amount,
            symbol: assetMeta?.symbol,
            where: "Omnipool",
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    return await createTransaction(
      { tx: api.tx.omnipool.addLiquidity(assetId, amount) },
      {
        onSuccess: (result) => {
          onSuccess(result, amount)
        },
        onSubmitted: () => {
          !farms.length && !isJoinFarms && onClose()
          reset()
          onSubmitted?.()
        },
        onClose,
        disableAutoClose: !!farms.length && isJoinFarms,
        onBack: () => {},
        toast,
        onError: onClose,
      },
    )
  }

  const onInvalidSubmit = (
    errors: FieldErrors<FormValues<typeof form>>,
    e?: BaseSyntheticEvent,
  ) => {
    const submitAction = (e?.nativeEvent as SubmitEvent)
      ?.submitter as HTMLButtonElement

    if (
      submitAction?.name === "addLiquidity" &&
      (errors.amount as { farm?: { message: string } }).farm
    ) {
      onSubmit(form.getValues())
    }
  }

  const customErrors = formState.errors.amount as unknown as
    | {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      }
    | undefined

  const isAddOnlyLiquidityDisabled = !!Object.keys(
    formState.errors.amount ?? {},
  ).filter((key) => key !== "farm").length

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
              balance={balance}
              balanceMax={balanceMax}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <SummaryRow
          label={t("liquidity.add.modal.lpFee")}
          content={
            assetId === native.id
              ? "--"
              : t("value.percentage.range", {
                  from: omnipoolFee?.minFee.multipliedBy(100),
                  to: omnipoolFee?.maxFee.multipliedBy(100),
                })
          }
        />
        <Spacer size={24} />
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
        <Text color="warningOrange200" fs={14} fw={400} sx={{ mt: 17, mb: 24 }}>
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

        {customErrors?.farm && (
          <Alert variant="warning" css={{ margin: "20px 0" }}>
            {customErrors.farm.message}
          </Alert>
        )}
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
      {farms.length ? (
        <div sx={{ flex: "row", justify: "space-between" }}>
          <Button
            variant="secondary"
            name="addLiquidity"
            onClick={() => setIsJoinFarms(false)}
            disabled={
              isAddOnlyLiquidityDisabled || !zodSchema || !formState.isDirty
            }
          >
            {t("liquidity.add.modal.onlyAddLiquidity")}
          </Button>
          <Button
            variant="primary"
            name="joinFarms"
            onClick={() => setIsJoinFarms(true)}
            disabled={
              !!Object.keys(formState.errors).length ||
              !zodSchema ||
              !formState.isDirty
            }
          >
            {t("liquidity.add.modal.joinFarms")}
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          disabled={!!Object.keys(formState.errors).length || !zodSchema}
        >
          {t("liquidity.add.modal.confirmButton")}
        </Button>
      )}
    </form>
  )
}
