import {
  Button,
  ModalBody,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@galacticcouncil/ui/components"
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
  const titleI18n = t("trade.cancelOrder.title", {
    returnObjects: true,
  }) as string[]

  return (
    <>
      <ModalHeader
        title={titleI18n.join(" ")}
        customTitle={
          <ModalTitle sx={{ textAlign: "center" }}>
            {titleI18n.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </ModalTitle>
        }
        customDescription={
          sold && total ? (
            <ModalDescription sx={{ textAlign: "center" }}>
              {(
                t("trade.cancelOrder.recap", {
                  returnObjects: true,
                  sold: t("common:currency", {
                    value: sold,
                    symbol,
                  }),
                  total: t("common:currency", {
                    value: total,
                    symbol,
                  }),
                }) as string[]
              ).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </ModalDescription>
          ) : undefined
        }
      />
      <ModalBody sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={onBack}>
          {t("trade.cancelOrder.close")}
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {t("trade.cancelOrder.cta")}
        </Button>
      </ModalBody>
    </>
  )
}
