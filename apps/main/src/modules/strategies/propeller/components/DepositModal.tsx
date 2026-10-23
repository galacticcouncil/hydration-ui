import {
  Box,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useAccountBalances } from "@/api/balances"
import { DepositForm } from "@/modules/strategies/propeller/components/DepositForm"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { getVaultDepositOption } from "@/modules/strategies/propeller/utils/depositOptions"

type Props = {
  vault: PropellerVaultConfig | null
  onClose: () => void
}

export const DepositModal = ({ vault, onClose }: Props) => {
  const { t } = useTranslation("propeller")
  const { getTransferableBalance } = useAccountBalances()

  return (
    <Modal variant="popup" open={!!vault} onOpenChange={onClose}>
      <ModalHeader
        title={vault ? t("deposit.modal.title", { name: vault.shareName }) : ""}
      />
      <ModalBody scrollable={false} noPadding>
        {vault && (
          <Box px="xl" position="relative">
            <DepositForm
              key={vault.vaultAddress}
              initialDeposit={getVaultDepositOption(
                vault,
                getTransferableBalance,
              )}
              lockVault
              onSuccess={onClose}
            />
          </Box>
        )}
      </ModalBody>
    </Modal>
  )
}
