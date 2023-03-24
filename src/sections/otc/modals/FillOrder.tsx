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
import { FormValues } from "utils/helpers"
import { useAccountStore, useStore } from "../../../state/store"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetGet, OrderAssetPay } from "./cmp/AssetSelect"
import { OfferingPair } from "../orders/OtcOrdersData.utils"

type PlaceOrderProps = {
  orderId: string
  offering: OfferingPair
  accepting: OfferingPair
  onClose: () => void
  onSuccess: () => void
}

export const FillOrder = ({
  orderId,
  offering,
  accepting,
  onClose,
  onSuccess,
}: PlaceOrderProps) => {
  const { t } = useTranslation()

  const form = useForm<{
    amountIn: string
    amountOut: string
    free: BigNumber
  }>({
    defaultValues: {
      free: offering.amount,
    },
  })

  const api = useApiPromise()
  const assetInMeta = useAssetMeta(accepting.asset)
  const assetOutMeta = useAssetMeta(offering.asset)
  const { account } = useAccountStore()
  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = useAssetMeta(accountCurrency.data)
  const { createTransaction } = useStore()

  const { data: paymentInfoData } = usePaymentInfo(api.tx.otc.fillOrder(""))

  const price = accepting.amount.div(offering.amount)

  const handleSubmit = async (values: FormValues<typeof form>) => {
    await createTransaction(
      {
        tx: api.tx.otc.fillOrder(orderId),
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
              i18nKey="otc.order.place.toast.onLoading"
              tOptions={{}}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="otc.order.place.toast.onSuccess"
              tOptions={{}}
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
      open={true}
      withoutOutsideClose
      title={t("otc.order.fill.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <Text fs={16} color="basic400" sx={{ mt: 10, mb: 22 }}>
        {t("otc.order.fill.desc")}
      </Text>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
        }}
      >
        <OrderAssetPay
          title={t("otc.order.fill.payTitle")}
          value={accepting.amount.toFixed()}
          asset={accepting.asset}
          readonly={true}
        />
        <OrderAssetPrice
          inputAsset={assetOutMeta.data?.symbol}
          outputAsset={assetInMeta.data?.symbol}
          price={price && price.toFixed()}
        />
        <OrderAssetGet
          title={t("otc.order.fill.getTitle")}
          value={offering.amount.toFixed()}
          remaining={offering.amount}
          asset={offering.asset}
          readonly={true}
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
        <Button sx={{ mt: 20 }} variant="primary">
          {t("otc.order.fill.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
