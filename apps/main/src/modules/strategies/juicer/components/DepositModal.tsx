import {
  Box,
  Modal,
  ModalBody,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { DepositForm } from "@/modules/strategies/juicer/components/DepositForm"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import {
  DEPOSIT_OPTIONS,
  useDepositBalancesUsd,
} from "@/modules/strategies/juicer/hooks/useDepositBalancesUsd"
import { selectDefaultDeposit } from "@/modules/strategies/juicer/utils/defaultVault"

type DepositModalProps = {
  vault: JuicerVaultConfig | null
  onClose: () => void
}

export const DepositModal: FC<DepositModalProps> = ({ vault, onClose }) => {
  const { t } = useTranslation("juicer")
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
