import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/propeller/components/WithdrawModalForm"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { useVaultDisplayAsset } from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"

type Props = {
  vault: PropellerVaultConfig
  open: boolean
  onClose: () => void
}

export const WithdrawModal = ({ vault, open, onClose }: Props) => {
  const { t } = useTranslation("propeller")
  const getDisplayAsset = useVaultDisplayAsset()

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader
        title={t("withdraw.title", { symbol: getDisplayAsset(vault).symbol })}
      />
      <WithdrawModalForm vault={vault} onSuccess={onClose} />
    </Modal>
  )
}
