import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/propeller/components/WithdrawModalForm"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

type Props = {
  vault: PropellerVaultConfig
  open: boolean
  onClose: () => void
}

export const WithdrawModal = ({ vault, open, onClose }: Props) => {
  const { t } = useTranslation("propeller")

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader
        title={t("withdraw.title", { shareSymbol: vault.shareSymbol })}
      />
      <WithdrawModalForm vault={vault} onSuccess={onClose} />
    </Modal>
  )
}
