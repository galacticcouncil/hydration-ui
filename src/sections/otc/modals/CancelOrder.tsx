import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { useApiPromise } from "utils/api"
import { useStore } from "../../../state/store"
import { OfferingPair } from "../orders/OtcOrdersData.utils"
import { SContainer } from "./CancelOrder.styled"

type CancelOrderProps = {
  orderId: string
  offering: OfferingPair
  onClose: () => void
  onSuccess: () => void
}

export const CancelOrder = ({
  orderId,
  offering,
  onClose,
  onSuccess,
}: CancelOrderProps) => {
  const { t } = useTranslation()

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const handleClose = async () => {
    await createTransaction(
      {
        tx: api.tx.otc.cancelOrder(orderId),
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
              i18nKey="otc.order.cancel.toast.onLoading"
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
              i18nKey="otc.order.cancel.toast.onSuccess"
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
      withoutClose
      onClose={() => {
        onClose()
      }}
    >
      <SContainer>
        <Text
          fs={24}
          color="white"
          font="FontOver"
          as="div"
          sx={{ mt: 10, mb: 10, textAlign: "center" }}
        >
          {t("otc.order.cancel.title")}
        </Text>
        {offering.initial && (
          <Text fs={16} color="basic400" sx={{ textAlign: "center" }}>
            {t("otc.order.cancel.recap", {
              sold: offering.initial.minus(offering.amount),
              total: offering.initial,
              symbol: offering.symbol,
            })}
          </Text>
        )}
        <div sx={{ mt: 30, flex: "row", justify: "space-between", gap: 20 }}>
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button variant="primary" onClick={handleClose}>
            {t("otc.order.cancel.confirm")}
          </Button>
        </div>
      </SContainer>
    </Modal>
  )
}
