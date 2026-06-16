import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/hdcl/components/WithdrawModalForm"
import type {
  HdclPoolPosition,
  HdclReserveConfig,
} from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import type { VaultStats } from "@/modules/strategies/hdcl/hooks/useVaultReads"

type WithdrawModalProps = {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  hdclBalance: number
  withdrawSource: "supplied" | "raw"
  poolPosition: HdclPoolPosition | undefined
  reserveConfig: HdclReserveConfig | undefined
  onRequestRedeem: (amount: number) => void
  onInstantRedeem?: (amount: number) => void
  isPending: boolean
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onClose,
  vaultStats,
  hdclBalance,
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
      <ModalHeader title={t("hdcl.withdraw.title")} />
      <WithdrawModalForm
        vaultStats={vaultStats}
        hdclBalance={hdclBalance}
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
