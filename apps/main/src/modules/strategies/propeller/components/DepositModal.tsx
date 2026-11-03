import {
  Box,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { DepositForm } from "@/modules/strategies/propeller/components/DepositForm"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  DEPOSIT_OPTIONS,
  useDepositBalancesUsd,
} from "@/modules/strategies/propeller/hooks/useDepositBalancesUsd"
import { selectDefaultDeposit } from "@/modules/strategies/propeller/utils/defaultVault"

type Props = {
  vault: PropellerVaultConfig | null
  onClose: () => void
}

export const DepositModal = ({ vault, onClose }: Props) => {
  const { t } = useTranslation("propeller")
  const { symbols, balancesUsd, isLoading } = useDepositBalancesUsd()

  // the form keeps its own selection after mounting
  const initialDeposit =
    vault && !isLoading
      ? selectDefaultDeposit(
          DEPOSIT_OPTIONS.filter(
            (o) => o.vault.vaultAddress === vault.vaultAddress,
          ),
          { symbols, balancesUsd },
        )
      : null

  return (
    <Modal variant="popup" open={!!vault} onOpenChange={onClose}>
      <ModalHeader
        title={vault ? t("deposit.modal.title", { name: vault.shareName }) : ""}
      />
      <ModalBody scrollable={false} noPadding>
        {vault && (
          <Box px="xl" position="relative">
            {initialDeposit ? (
              <DepositForm
                key={vault.vaultAddress}
                initialDeposit={initialDeposit}
                lockVault
                onSuccess={onClose}
              />
            ) : (
              <AppSkeleton />
            )}
          </Box>
        )}
      </ModalBody>
    </Modal>
  )
}
