import { useAssetMeta } from "api/assetMeta"
import { useTokenBalance } from "api/balances"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useApiPromise } from "utils/api"
import { BN_10 } from "utils/constants"
import { useAccountStore, useStore } from "../../../state/store"
import { OfferingPair } from "../orders/OtcOrdersData.utils"
import { OrderAssetPrice } from "./cmp/AssetPrice"
import { OrderAssetGet, OrderAssetPay } from "./cmp/AssetSelect"

type FillOrderProps = {
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
}: FillOrderProps) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const api = useApiPromise()
  const assetInMeta = useAssetMeta(accepting.asset)
  const assetInBalance = useTokenBalance(accepting.asset, account?.address)
  const assetOutMeta = useAssetMeta(offering.asset)
  const [error, setError] = useState<string | undefined>(undefined)

  const { createTransaction } = useStore()

  const price = accepting.amount.div(offering.amount)

  const handleSubmit = async () => {
    if (assetInMeta.data?.decimals == null)
      throw new Error("Missing assetIn meta")

    if (assetInBalance.data?.balance == null)
      throw new Error("Missing assetIn balance")

    const aInBalance = assetInBalance.data?.balance
    const aInDecimals = assetInMeta.data?.decimals.toString()

    if (aInBalance.gte(accepting.amount.multipliedBy(BN_10.pow(aInDecimals)))) {
      setError(undefined)
    } else {
      setError(t("otc.order.fill.validation.notEnoughBalance"))
      return
    }

    await createTransaction(
      {
        tx: api.tx.otc.fillOrder(orderId),
      },
      {
        onSuccess,
        onSubmitted: () => {
          onClose()
        },
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="otc.order.fill.toast.onLoading"
              tOptions={{
                amount: offering.amount,
                symbol: offering.symbol,
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
                amount: offering.amount,
                symbol: offering.symbol,
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
      open={true}
      disableCloseOutside
      title={t("otc.order.fill.title")}
      onClose={onClose}
    >
      <Text fs={16} color="basic400" sx={{ mt: 10, mb: 22 }}>
        {t("otc.order.fill.desc")}
      </Text>
      <form
        onSubmit={handleSubmit}
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
          balance={assetInBalance.data?.balance}
          readonly={true}
          error={error}
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
        <Button sx={{ mt: 20 }} variant="primary">
          {t("otc.order.fill.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
