import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { useAssetMeta } from "api/assetMeta"
import { useAccountCurrency } from "api/payments"
import { usePaymentInfo } from "api/transaction"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useApiPromise } from "utils/api"
import { BN_10 } from "utils/constants"
import { FormValues } from "utils/helpers"
import { useAccountStore, useStore } from "../../../state/store"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetSelect } from "./cmp/AssetSelect"

type PlaceOrderProps = {
  assetIn: u32 | string
  assetOut: u32 | string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const PlaceOrder = ({
  isOpen,
  assetIn,
  assetOut,
  onClose,
  onSuccess,
}: PlaceOrderProps) => {
  const { t } = useTranslation()
  const [aIn, setAIn] = useState(assetIn)
  const [aOut, setAOut] = useState(assetOut)
  const [price, setPrice] = useState<string | null>()

  const form = useForm<{
    amountIn: string
    amountOut: string
    partiallyFillable: boolean
  }>({
    defaultValues: { partiallyFillable: false },
  })

  const api = useApiPromise()
  const assetInMeta = useAssetMeta(aIn)
  const assetOutMeta = useAssetMeta(aOut)
  const { account } = useAccountStore()
  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = useAssetMeta(accountCurrency.data)
  const { createTransaction } = useStore()

  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.otc.placeOrder(aIn, aOut, "0", "0", false),
  )

  const handlePriceChange = () => {
    const { amountIn, amountOut } = form.getValues()
    if (amountIn && amountOut) {
      const price = new BigNumber(amountOut).div(new BigNumber(amountIn))
      setPrice(price.toFixed())
    } else {
      setPrice(null)
    }
  }

  const handleSubmit = async (values: FormValues<typeof form>) => {
    if (assetInMeta.data?.decimals == null)
      throw new Error("Missing assetIn meta")
    if (assetOutMeta.data?.decimals == null)
      throw new Error("Missing assetOut meta")

    const amountInBN = new BigNumber(values.amountIn).multipliedBy(
      BN_10.pow(assetInMeta.data?.decimals.toString()),
    )
    const amountOutBN = new BigNumber(values.amountOut).multipliedBy(
      BN_10.pow(assetOutMeta.data?.decimals.toString()),
    )

    await createTransaction(
      {
        tx: api.tx.otc.placeOrder(
          aIn,
          aOut,
          amountInBN.toFixed(),
          amountOutBN.toFixed(),
          false,
        ),
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
      open={isOpen}
      withoutOutsideClose
      title={t("otc.order.place.title")}
      onClose={() => {
        onClose()
        form.reset()
      }}
    >
      <Text fs={16} color="darkBlue300" sx={{ mt: 10, mb: 22 }}>
        {t("otc.order.place.desc")}
      </Text>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          height: "calc(100% - var(--modal-header-title-height))",
        }}
      >
        <Controller
          name="amountIn"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <OrderAssetSelect
              title={t("otc.order.place.offer")}
              name={name}
              value={value}
              onChange={(e) => {
                onChange(e)
                handlePriceChange()
              }}
              asset={aIn}
              onAssetChange={setAIn}
              error={error?.message}
            />
          )}
        />
        <OrderAssetPrice
          inputAsset={assetInMeta.data?.symbol}
          outputAsset={assetOutMeta.data?.symbol}
          price={price!}
        />
        <Controller
          name="amountOut"
          control={form.control}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <OrderAssetSelect
              title={t("otc.order.place.accept")}
              name={name}
              value={value}
              onChange={(e) => {
                onChange(e)
                handlePriceChange()
              }}
              asset={aOut}
              onAssetChange={setAOut}
              error={error?.message}
            />
          )}
        />
        <div
          sx={{
            mt: 18,
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
          {t("otc.order.place.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
