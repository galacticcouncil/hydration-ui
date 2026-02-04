import { LoadingButton } from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { AuthorizedActionForChain } from "@/modules/xcm/transfer/components/AuthorizedActionForChain"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"

import { SSubmitButton } from "./SubmitButton.styled"

type SubmitButtonProps = React.ComponentPropsWithoutRef<
  typeof LoadingButton
> & {
  chain: AnyChain | null
  status: XcmTransferStatus
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  chain,
  status,
  ...props
}) => {
  const { t } = useTranslation(["xcm", "common"])

  const getSubmitButtonText = () => {
    switch (status) {
      case XcmTransferStatus.TransferInvalid:
        return t("form.transferInvalid")
      case XcmTransferStatus.AmountMissing:
        return t("form.amountMissing")
      case XcmTransferStatus.RecipientMissing:
        return t("form.recipientMissing")
      case XcmTransferStatus.InsufficientBalance:
        return t("form.insufficientBalance")
      case XcmTransferStatus.ApproveAndTransferValid:
        return t("form.submit.approve")
      default:
        return t("common:transfer")
    }
  }

  return (
    <AuthorizedActionForChain chain={chain} size="large" width="100%">
      <SSubmitButton {...props} size="large" type="submit" width="100%">
        {!props.isLoading && getSubmitButtonText()}
      </SSubmitButton>
    </AuthorizedActionForChain>
  )
}
