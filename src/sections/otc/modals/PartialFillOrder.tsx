import BigNumber from "bignumber.js"
import { useAssetMeta } from "api/assetMeta"
import { useAccountCurrency } from "api/payments"
import { usePaymentInfo } from "api/transaction"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useApiPromise } from "utils/api"
import { getFixedPointAmount } from "utils/balance"
import { BN_0, BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useAccountStore, useStore } from "../../../state/store"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetGet, OrderAssetPay } from "./cmp/AssetSelect"
import { OrderCapacity } from "../capacity/OrderCapacity"
import { OfferingPair } from "../orders/OtcOrdersData.utils"
import { useEffect } from "react"
import { useTokenBalance } from "api/balances"

type PlaceOrderProps = {
  orderId: string
  offering: OfferingPair
  accepting: OfferingPair
  onClose: () => void
  onSuccess: () => void
}

export const PartialFillOrder = ({
  orderId,
  offering,
  accepting,
  onClose,
  onSuccess,
}: PlaceOrderProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const form = useForm<{
    amountIn: string
    amountOut: string
    free: BigNumber
  }>({
    defaultValues: {
      free: offering.amount,
    },
  })

  useEffect(() => {
    form.trigger()
  }, [form])

  const api = useApiPromise()
  const assetInMeta = useAssetMeta(accepting.asset)
  const assetInBalance = useTokenBalance(accepting.asset, account?.address)
  const assetOutMeta = useAssetMeta(offering.asset)
  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = useAssetMeta(accountCurrency.data)
  const { createTransaction } = useStore()

  const { data: paymentInfoData } = usePaymentInfo(api.tx.otc.fillOrder(""))

  const price = accepting.amount.div(offering.amount)

  const handlePayWithChange = () => {
    const { amountOut } = form.getValues()
    const amountIn = new BigNumber(amountOut).multipliedBy(price)
    form.setValue("amountIn", amountIn.toFixed())
    form.trigger()
  }

  const handleYouGetChange = () => {
    const { amountIn } = form.getValues()
    const amountOut = new BigNumber(amountIn).div(price)
    form.setValue("amountOut", amountOut.toFixed())
    form.trigger()
  }

  const handleFreeChange = () => {
    const { amountOut, amountIn } = form.getValues()
    if (!amountOut || !amountIn) {
      form.setValue("free", offering.amount)
      return
    }

    const aOut = new BigNumber(amountOut)
    const free = aOut.gt(offering.amount)
      ? BN_0
      : offering.amount.minus(new BigNumber(amountOut))
    form.setValue("free", free)
  }

  const handleSubmit = async (values: FormValues<typeof form>) => {
    if (assetInMeta.data?.decimals == null)
      throw new Error("Missing assetIn meta")

    const amountIn = getFixedPointAmount(
      values.amountIn,
      assetInMeta.data.decimals.toString(),
    ).decimalPlaces(0, 1)

    await createTransaction(
      {
        tx: api.tx.otc.partialFillOrder(orderId, amountIn.toFixed()),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans t={t} i18nKey="otc.order.fill.toast.onLoading" tOptions={{}}>
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans t={t} i18nKey="otc.order.fill.toast.onSuccess" tOptions={{}}>
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <Modal
      open={true}
      withoutOutsideClose
      title={t("otc.order.fill.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "baseline",
          mt: 20,
        }}
      >
        <Text fs={16} color="basic500">
          {"Available amount:"}
        </Text>
        <Text fs={24} color="white" font="FontOver" as="div">
          {t("otc.order.fill.remaining", {
            remaining: offering.amount,
            symbol: offering.symbol,
          })}
        </Text>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
        }}
      >
        <Controller
          name="free"
          control={form.control}
          render={({ field: { value } }) => (
            <OrderCapacity
              total={offering.amount}
              free={value}
              symbol={offering.symbol}
              modal={true}
            />
          )}
        />
        <Controller
          name="amountIn"
          control={form.control}
          rules={{
            required: true,
            validate: {
              maxBalance: (value) => {
                const balance = assetInBalance.data?.balance
                const decimals = assetInMeta.data?.decimals.toString()
                if (
                  balance &&
                  decimals &&
                  balance.gte(
                    new BigNumber(value).multipliedBy(BN_10.pow(decimals)),
                  )
                ) {
                  return true
                }
                return t("otc.order.fill.validation.notEnoughBalance")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <OrderAssetPay
              title={t("otc.order.fill.payTitle")}
              name={name}
              value={value}
              onChange={(e) => {
                onChange(e)
                handleYouGetChange()
                handleFreeChange()
              }}
              asset={accepting.asset}
              balance={assetInBalance.data?.balance}
              error={error?.message}
            />
          )}
        />
        <OrderAssetPrice
          inputAsset={assetOutMeta.data?.symbol}
          outputAsset={assetInMeta.data?.symbol}
          price={price && price.toFixed()}
        />
        <Controller
          name="amountOut"
          control={form.control}
          rules={{
            required: true,
            validate: {
              orderTooBig: (value) => {
                if (offering.amount.gte(new BigNumber(value))) {
                  return true
                }
                return t("otc.order.fill.validation.orderTooBig")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <OrderAssetGet
              title={t("otc.order.fill.getTitle")}
              name={name}
              value={value}
              onChange={(e) => {
                onChange(e)
                handlePayWithChange()
                handleFreeChange()
              }}
              remaining={offering.amount}
              asset={offering.asset}
              error={error?.message}
            />
          )}
        />
        <div
          sx={{
            mt: 14,
            flex: "row",
            justify: "space-between",
          }}
        >
          <Text fs={13} color="darkBlue300">
            {t("otc.order.place.fee")}
          </Text>
          <div sx={{ flex: "row", align: "center", gap: 4 }}>
            {paymentInfoData?.partialFee != null && (
              <Text fs={14}>
                {t("otc.order.place.feeValue", {
                  amount: new BigNumber(paymentInfoData.partialFee.toHex()),
                  symbol: accountCurrencyMeta.data?.symbol,
                  fixedPointScale: accountCurrencyMeta.data?.decimals,
                })}
              </Text>
            )}
          </div>
        </div>
        <Button
          sx={{ mt: 20 }}
          variant="primary"
          disabled={!form.formState.isValid}
        >
          {t("otc.order.fill.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
