import { Button, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly sold: string | null
  readonly total: string | null
  readonly symbol: string
  readonly onBack: () => void
  readonly onSubmit: () => void
}

export const CancelTradeOrderModalContent: FC<Props> = ({
  sold,
  total,
  symbol,
  onBack,
  onSubmit,
}) => {
  const { t } = useTranslation(["trade", "common"])

  return (
    <>
      <ModalHeader
        title={t("trade.cancelOrder.title")}
        align="center"
        description={t("trade.cancelOrder.recap", {
          sold: t("common:currency", {
            value: sold,
            symbol,
          }),
          total: t("common:currency", {
            value: total,
            symbol,
          }),
        })}
      />
      <ModalBody sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={onBack}>
          {t("common:back")}
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {t("trade.cancelOrder.cta")}
        </Button>
      </ModalBody>
    </>
  )
}
