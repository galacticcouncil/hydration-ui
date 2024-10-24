import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { FormValues } from "utils/helpers"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { required, maxBalance } from "utils/validators"
import { ISubmittableResult } from "@polkadot/types/types"
import { TAsset } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { CurrencyReserves } from "sections/pools/stablepool/components/CurrencyReserves"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { useEstimatedFees } from "api/transaction"
import { createToastMessages } from "state/toasts"
import {
  getAddToOmnipoolFee,
  useAddToOmnipoolZod,
} from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { TFarmAprData } from "api/farms"
import { scale } from "utils/balance"
import { Alert } from "components/Alert/Alert"
import { useEffect } from "react"
import { Switch } from "components/Switch/Switch"
import { FarmDetailsRow } from "sections/pools/farms/components/detailsCard/FarmDetailsRow"
import { Separator } from "components/Separator/Separator"
import { useAccountAssets } from "api/deposits"

type Props = {
  poolId: string
  fee: BigNumber
  asset: TAsset
  onSuccess: (result: ISubmittableResult, shares: string) => void
  onClose: () => void
  onCancel: () => void
  onAssetOpen: () => void
  onSubmitted: (shares?: string) => void
  reserves: { asset_id: number; amount: string }[]
  isStablepoolOnly: boolean
  farms: TFarmAprData[]
  isJoinFarms: boolean
  setIsJoinFarms: (value: boolean) => void
}

const createFormSchema = (balance: BigNumber, decimals: number) =>
  z.object({
    value: required.pipe(maxBalance(balance, decimals)),
  })

export const AddStablepoolLiquidity = ({
  poolId,
  asset,
  onSuccess,
  onAssetOpen,
  onSubmitted,
  onClose,
  onCancel,
  reserves,
  fee,
  isStablepoolOnly,
  farms,
  isJoinFarms,
  setIsJoinFarms,
}: Props) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const accountBalances = useAccountAssets()

  const { t } = useTranslation()

  const walletBalance = accountBalances.data?.accountAssetsMap.get(
    asset.id,
  )?.balance

  const omnipoolZod = useAddToOmnipoolZod(poolId, farms, true)

  const estimationTxs = [
    api.tx.stableswap.addLiquidity(poolId, [
      { assetId: asset.id, amount: "1" },
    ]),
    ...(!isStablepoolOnly ? getAddToOmnipoolFee(api, farms) : []),
  ]

  const estimatedFees = useEstimatedFees(estimationTxs)

  const balance = walletBalance?.balance ?? BN_0
  const balanceMax =
    estimatedFees.accountCurrencyId === asset.id
      ? balance
          .minus(estimatedFees.accountCurrencyFee)
          .minus(asset.existentialDeposit)
      : balance

  const stablepoolZod = createFormSchema(balanceMax, asset?.decimals)

  const form = useForm<{ value: string; amount: string }>({
    mode: "onChange",
    resolver: zodResolver(
      !isStablepoolOnly && omnipoolZod
        ? omnipoolZod.merge(stablepoolZod)
        : stablepoolZod,
    ),
  })
  const { formState } = form
  const displayPrice = useDisplayPrice(asset.id)

  const shares = form.watch("amount")

  const getShares = useStablepoolShares({
    poolId,
    asset,
    reserves,
  })

  const handleShares = (value: string) => {
    const shares = getShares(value)

    if (shares) {
      form.setValue("amount", shares, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (asset.decimals == null) {
      throw new Error("Missing asset meta")
    }

    const toast = createToastMessages("liquidity.add.modal.toast", {
      t,
      tOptions: {
        value: values.value,
        symbol: asset.symbol,
        where: "Stablepool",
      },
      components: ["span", "span.highlight"],
    })

    return await createTransaction(
      {
        tx: api.tx.stableswap.addLiquidity(poolId, [
          {
            assetId: asset.id,
            amount: scale(values.value, asset.decimals).toString(),
          },
        ]),
      },
      {
        onSuccess: (result) =>
          onSuccess(
            result,
            scale(values.amount, STABLEPOOL_TOKEN_DECIMALS).toString(),
          ),
        onSubmitted: () => {
          onSubmitted(shares)
          form.reset()
        },
        onError: () => {
          onClose()
        },
        onClose,
        disableAutoClose: !isStablepoolOnly,
        onBack: () => {},
        toast,
      },
    )
  }

  const onInvalidSubmit = (errors: FieldErrors<FormValues<typeof form>>) => {
    if (
      !isJoinFarms &&
      (errors.amount as { farm?: { message: string } }).farm
    ) {
      onSubmit(form.getValues())
    }
  }

  const customErrors = form.formState.errors.amount as unknown as
    | {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      }
    | undefined

  const isJoinFarmDisabled = !!customErrors?.farm
  const isSubmitDisabled =
    farms.length > 0 && isJoinFarms
      ? !!Object.keys(formState.errors).length
      : !!Object.keys(formState.errors.amount ?? {}).filter(
          (key) => key !== "farm",
        ).length

  useEffect(() => {
    if (!farms.length || isStablepoolOnly) return
    if (isJoinFarmDisabled) {
      setIsJoinFarms(false)
    } else {
      setIsJoinFarms(true)
    }
  }, [farms.length, isJoinFarmDisabled, isStablepoolOnly, setIsJoinFarms])

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column" }}>
        <Controller
          name="value"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onChange={(v) => {
                onChange(v)
                handleShares(v)
              }}
              balance={balance}
              balanceMax={balanceMax}
              asset={asset.id}
              error={error?.message}
              onAssetOpen={onAssetOpen}
            />
          )}
        />
        <Spacer size={20} />
        <SummaryRow
          label={t("liquidity.add.modal.tradeFee")}
          content={t("value.percentage", { value: fee.multipliedBy(100) })}
          description={t("liquidity.add.modal.tradeFee.description")}
        />
        <Separator
          color="darkBlue401"
          sx={{
            my: 4,
            width: "auto",
          }}
        />
        {farms.length > 0 && !isStablepoolOnly && (
          <>
            <SummaryRow
              label={t("liquidity.add.modal.joinFarms")}
              description={t("liquidity.add.modal.joinFarms.description")}
              content={
                <div sx={{ flex: "row", align: "center", gap: 8 }}>
                  <Text fs={14} color="darkBlue200">
                    {isJoinFarms ? t("yes") : t("no")}
                  </Text>
                  <Switch
                    name="join-farms"
                    value={isJoinFarms}
                    onCheckedChange={setIsJoinFarms}
                    disabled={isJoinFarmDisabled}
                  />
                </div>
              }
            />
            {isJoinFarms && (
              <div sx={{ flex: "column", gap: 8, mt: 8 }}>
                {farms.map((farm) => (
                  <FarmDetailsRow key={farm.globalFarmId} farm={farm} />
                ))}
              </div>
            )}
            {customErrors?.farm && (
              <Alert variant="warning" sx={{ mt: 8 }}>
                {customErrors.farm.message}
              </Alert>
            )}
          </>
        )}
        <Spacer size={20} />
        <CurrencyReserves reserves={reserves} />
        <Spacer size={20} />
        <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>
        <Summary
          rows={[
            {
              label: t("liquidity.add.modal.shareTokens"),
              content: t("value", {
                value: shares,
                type: "token",
              }),
            },
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
                    <DisplayValue value={displayPrice.data?.spotPrice} />
                  </Trans>
                </Text>
              ),
            },
          ]}
        />
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

        <Spacer size={20} />
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
