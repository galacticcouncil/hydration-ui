import { Modal } from "components/Modal/Modal"
import { ComponentProps } from "react"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"

type Props = ComponentProps<typeof LiquidityPosition> & {
  isOpen: boolean
  onClose: () => void
}

export const LiquidityPositionModal = ({
  isOpen,
  onClose,
  ...props
}: Props) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isOpen}
      title={t("liquidity.positions.modal.title")}
      headerVariant="FontOver"
      noPadding={true}
      onClose={onClose}
    >
      <div sx={{ flex: "column", align: "center", gap: 8 }}>
        <LiquidityPosition {...props} />
      </div>
    </Modal>
  )
}
