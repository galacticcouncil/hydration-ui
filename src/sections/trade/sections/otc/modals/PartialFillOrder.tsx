import { useTokenBalance } from "api/balances"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { getFixedPointAmount } from "utils/balance"
import { BN_0, BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useStore } from "state/store"
import { OrderCapacity } from "sections/trade/sections/otc/capacity/OrderCapacity"
import { OfferingPair } from "sections/trade/sections/otc/orders/OtcOrdersData.utils"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetGet, OrderAssetPay } from "./cmp/AssetSelect"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

const FULL_ORDER_PCT_LBOUND = 99

type FillOrderProps = {
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
}: FillOrderProps) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const form = useForm<{
    amountIn: string
    amountOut: string
    free: BigNumber
  }>({
    defaultValues: {
      free: accepting.amount,
    },
  })

  useEffect(() => {
    form.trigger()
  }, [form])

  const { api, assets } = useRpcProvider()
  const assetInMeta = assets.getAsset(accepting.asset)
  const assetInBalance = useTokenBalance(accepting.asset, account?.address)
  const assetOutMeta = assets.getAsset(offering.asset)

  const { createTransaction } = useStore()

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
      form.setValue("free", accepting.amount)
      return
    }

    const aIn = new BigNumber(amountIn)
    const free = aIn.gt(accepting.amount) ? BN_0 : accepting.amount.minus(aIn)
    form.setValue("free", free)
  }

  const handleSubmit = async (values: FormValues<typeof form>) => {
    if (assetInMeta.decimals == null) throw new Error("Missing assetIn meta")

    const amountIn = getFixedPointAmount(
      values.amountIn,
      assetInMeta.decimals,
    ).decimalPlaces(0, 1)

    const filledPct = new BigNumber(values.amountIn)
      .div(accepting.amount)
      .multipliedBy(100)
      .toNumber()

    await createTransaction(
      {
        tx:
          filledPct > FULL_ORDER_PCT_LBOUND
            ? api.tx.otc.fillOrder(orderId)
            : api.tx.otc.partialFillOrder(orderId, amountIn.toFixed()),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
          form.reset()
        },
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="otc.order.fill.toast.onLoading"
              tOptions={{
                amount: values.amountOut,
                symbol: assetOutMeta.symbol,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="otc.order.fill.toast.onSuccess"
              tOptions={{
                amount: values.amountOut,
                symbol: assetOutMeta.symbol,
              }}
            >
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
      open
      disableCloseOutside
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
          {"Remaining amount:"}
        </Text>
        <Text fs={[20, 24]} color="white" font="FontOver" as="div">
          {t("otc.order.fill.remaining", {
            remaining: accepting.amount,
            symbol: accepting.symbol,
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
              total={accepting.amount}
              free={value}
              symbol={accepting.symbol}
              modal={true}
              roundingMode={6}
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
                const decimals = assetInMeta.decimals.toString()
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
          inputAsset={assetOutMeta.symbol}
          outputAsset={assetInMeta.symbol}
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
