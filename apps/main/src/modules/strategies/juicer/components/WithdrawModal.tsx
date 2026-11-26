import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/juicer/components/WithdrawModalForm"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { useVaultDisplayAsset } from "@/modules/strategies/juicer/hooks/useCollateralEquivalent"

type WithdrawModalProps = {
  vault: JuicerVaultConfig
  open: boolean
  onClose: () => void
}

export const WithdrawModal: FC<WithdrawModalProps> = ({
  vault,
  open,
  onClose,
}) => {
  const { t } = useTranslation("juicer")
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
