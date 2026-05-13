import {
  Button,
  ModalContent,
  ModalRoot,
  ModalTrigger,
  Notification,
  ProgressBar,
  Text,
} from "@galacticcouncil/ui/components"
import {
  MultisigAccount,
  MultisigPendingTx,
} from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { useDecodedMultisigTx } from "@/api/multisig"
import { ReviewMultisig } from "@/modules/transactions/review/ReviewMultisig/ReviewMultisig"
import { parseTxMethodName } from "@/modules/transactions/utils/tx"

type MultisigNotificationProps = {
  tx: MultisigPendingTx
  multisig: MultisigAccount
}

export const MultisigNotification: React.FC<MultisigNotificationProps> = ({
  tx,
  multisig,
}) => {
  const { t } = useTranslation()
  const { data: decodedTx } = useDecodedMultisigTx(tx)

  const method = decodedTx?.tx
    ? parseTxMethodName(decodedTx?.tx, "value.value.call")
    : ""

  const approvedCount = tx.approvals.length
  const threshold = multisig.threshold ?? 0

  const progress = (approvedCount / threshold) * 100

  return (
    <Notification
      fullWidth
      autoClose={false}
      variant="submitted"
      content={
        method
          ? t("multisig.toast.named.title", {
              method,
            })
          : t("multisig.toast.unnamed.title")
      }
      description={
        <ProgressBar
          value={progress}
          customLabel={
            <Text fs="p5" fw={600}>
              {approvedCount}/{threshold}
            </Text>
          }
        />
      }
      actions={
        <ModalRoot>
          <ModalTrigger asChild>
            <Button size="small" variant="secondary">
              {t("multisig.review")}
            </Button>
          </ModalTrigger>
          <ModalContent onInteractOutside={(e) => e.preventDefault()}>
            <ReviewMultisig tx={tx} multisig={multisig} />
          </ModalContent>
        </ModalRoot>
      }
    />
  )
}
