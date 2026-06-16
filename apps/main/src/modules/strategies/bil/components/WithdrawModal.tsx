import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/bil/components/WithdrawModalForm"
import type {
  BilPoolPosition,
  BilReserveConfig,
} from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import type { VaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"

type WithdrawModalProps = {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  bilBalance: number
  withdrawSource: "supplied" | "raw"
  poolPosition: BilPoolPosition | undefined
  reserveConfig: BilReserveConfig | undefined
  onRequestRedeem: (amount: number) => void
  onInstantRedeem?: (amount: number) => void
  isPending: boolean
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onClose,
  vaultStats,
  bilBalance,
  withdrawSource,
  poolPosition,
  reserveConfig,
  onRequestRedeem,
  onInstantRedeem,
  isPending,
}) => {
  const { t } = useTranslation(["strategies"])

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("bil.withdraw.title")} />
      <WithdrawModalForm
        vaultStats={vaultStats}
        bilBalance={bilBalance}
        withdrawSource={withdrawSource}
        poolPosition={poolPosition}
        reserveConfig={reserveConfig}
        onRequestRedeem={onRequestRedeem}
        onInstantRedeem={onInstantRedeem}
        isPending={isPending}
      />
    </Modal>
  )
}
