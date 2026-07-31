import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { WithdrawModalForm } from "@/modules/strategies/bil/components/WithdrawModalForm"
import { useInstantRedeem } from "@/modules/strategies/bil/hooks/useStableswap"
import {
  useRequestRedeem,
  useRequestRedeemRaw,
} from "@/modules/strategies/bil/hooks/useVaultWrites"

type WithdrawModalProps = {
  open: boolean
  onClose: () => void
  withdrawSource: "supplied" | "raw"
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  open,
  onClose,
  withdrawSource,
}) => {
  const { t } = useTranslation(["strategies"])

  const redeemMutation = useRequestRedeem()
  const redeemRawMutation = useRequestRedeemRaw()
  const instantRedeemMutation = useInstantRedeem()

  const isPending =
    redeemMutation.isPending ||
    redeemRawMutation.isPending ||
    instantRedeemMutation.isPending

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("bil.withdraw.title")} />
      <WithdrawModalForm
        withdrawSource={withdrawSource}
        onRequestRedeem={(amount) => {
          if (withdrawSource === "raw") redeemRawMutation.mutate(amount)
          else redeemMutation.mutate(amount)
          onClose()
        }}
        onInstantRedeem={(amount) => {
          instantRedeemMutation.mutate(amount)
          onClose()
        }}
        isPending={isPending}
      />
    </Modal>
  )
}
