import { LoadingButton } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { XcmTransferStatus } from "@/modules/xcm/transfer/utils/transfer"

import { SSubmitButton } from "./SubmitButton.styled"

type SubmitButtonProps = React.ComponentPropsWithoutRef<
  typeof LoadingButton
> & {
  status: XcmTransferStatus
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  status,
  ...props
}) => {
  const { t } = useTranslation("xcm")

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
      default:
        return t("form.confirmSend")
    }
  }

  return (
    <AuthorizedAction size="large" width="100%">
      <SSubmitButton {...props} size="large" type="submit" width="100%">
        {!props.isLoading && getSubmitButtonText()}
      </SSubmitButton>
    </AuthorizedAction>
  )
}
