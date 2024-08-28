import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Spacer } from "components/Spacer/Spacer"
import { Summary } from "components/Summary/Summary"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { FormValues } from "utils/helpers"
import { PoolAddLiquidityInformationCard } from "sections/pools/modals/AddLiquidity/AddLiquidityInfoCard"
import { useStablepoolShares } from "./AddStablepoolLiquidity.utils"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useDisplayPrice } from "utils/displayAsset"
import { useTokenBalance } from "api/balances"
import { required, maxBalance } from "utils/validators"
import { ISubmittableResult } from "@polkadot/types/types"
import { TAsset } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { CurrencyReserves } from "sections/pools/stablepool/components/CurrencyReserves"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BN_0, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { useEstimatedFees } from "api/transaction"
import { createToastMessages } from "state/toasts"
import {
  getAddToOmnipoolFee,
  useAddToOmnipoolZod,
} from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { Farm } from "api/farms"
import { scale } from "utils/balance"
import { Alert } from "components/Alert/Alert"

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
  farms: Farm[]
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
}: Props) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  const { t } = useTranslation()

  const { account } = useAccount()
  const walletBalance = useTokenBalance(asset.id, account?.address)

  const omnipoolZod = useAddToOmnipoolZod(poolId, farms, true)

  const estimationTxs = [
    api.tx.stableswap.addLiquidity(poolId, [
      { assetId: asset.id, amount: "1" },
    ]),
    ...(!isStablepoolOnly ? getAddToOmnipoolFee(api, farms) : []),
  ]

  const estimatedFees = useEstimatedFees(estimationTxs)

  const balance = walletBalance.data?.balance ?? BN_0
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

  const customErrors = form.formState.errors.amount as unknown as
    | {
        cap?: { message: string }
        circuitBreaker?: { message: string }
        farm?: { message: string }
      }
    | undefined

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
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
        <SummaryRow
          label={t("liquidity.add.modal.tradeFee")}
          content={t("value.percentage", { value: fee.multipliedBy(100) })}
          description={t("liquidity.add.modal.tradeFee.description")}
        />
        <Spacer size={10} />
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

        {customErrors?.farm && (
          <Alert variant="error" css={{ margin: "20px 0" }}>
            {customErrors.farm.message}
          </Alert>
        )}
        <PoolAddLiquidityInformationCard />
        <Spacer size={20} />
      </div>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          gap: "100px",
          mb: [24, 0],
        }}
      >
        <Button variant="secondary" type="button" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          sx={{ width: "300px" }}
          variant="primary"
          disabled={!!Object.keys(form.formState.errors).length}
        >
          {t("confirm")}
        </Button>
      </div>
    </form>
  )
}
