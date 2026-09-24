import { Modal, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { DepositForm } from "@/modules/strategies/propeller/components/DepositForm"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  vault: PropellerVaultConfig | null
  onClose: () => void
}

export const DepositModal = ({ vault, onClose }: Props) => {
  const { t } = useTranslation("propeller")
  const { getAssetWithFallback } = useAssets()

  return (
    <Modal variant="popup" open={!!vault} onOpenChange={onClose}>
      <ModalHeader
        title={`${t("deposit.modal.title")} ${vault ? getAssetWithFallback(vault.assetId).symbol : ""}`}
      />
      <ModalBody scrollable={false} sx={{ py: 0 }}>
        {vault && (
          <DepositForm
            key={vault.vaultAddress}
            initialVault={vault}
            onSuccess={onClose}
          />
        )}
      </ModalBody>
    </Modal>
  )
}
