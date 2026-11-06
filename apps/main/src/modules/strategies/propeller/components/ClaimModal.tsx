import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { type FC } from "react"
import { useTranslation } from "react-i18next"

import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"

import { ClaimModalContent } from "./ClaimModalContent"

type ClaimModalProps = {
  row: PropellerWithdrawalRow
  open: boolean
  onClose: () => void
}

export const ClaimModal: FC<ClaimModalProps> = ({ row, open, onClose }) => {
  const { t } = useTranslation("propeller")

  return (
    <Modal variant="popup" open={open} onOpenChange={onClose}>
      <ModalHeader title={t("withdrawals.claim.title")} />
      <ClaimModalContent row={row} onClose={onClose} />
    </Modal>
  )
}
