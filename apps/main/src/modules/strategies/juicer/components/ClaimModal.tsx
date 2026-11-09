import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { type FC } from "react"
import { useTranslation } from "react-i18next"

import { type JuicerWithdrawalRow } from "@/modules/strategies/juicer/hooks/useJuicerAccount"

import { ClaimModalContent } from "./ClaimModalContent"

type ClaimModalProps = {
  row: JuicerWithdrawalRow
  open: boolean
  onClose: () => void
}

export const ClaimModal: FC<ClaimModalProps> = ({ row, open, onClose }) => {
  const { t } = useTranslation("juicer")

  return (
    <Modal variant="popup" open={open} onOpenChange={onClose}>
      <ModalHeader title={t("withdrawals.claim.title")} />
      <ClaimModalContent row={row} onClose={onClose} />
    </Modal>
  )
}
