import {
  Check,
  ExclamationMark,
  LoaderCircle,
  TriangleAlert,
} from "@galacticcouncil/ui/assets/icons"
import { Icon, Text } from "@galacticcouncil/ui/components"
import { ComponentProps, FC } from "react"
import { useTranslation } from "react-i18next"

import {
  STransactionStatus,
  STransactionStatusMessage,
  TransactionStatusVariant,
} from "@/components/TransactionItem/TransactionStatus.styled"

type Props = {
  readonly variant: TransactionStatusVariant
}

export const TransactionStatus: FC<Props> = ({ variant }) => {
  const { t } = useTranslation()

  const [icon, status] = (
    {
      [TransactionStatusVariant.Pending]: [LoaderCircle, t("pending")],
      [TransactionStatusVariant.Success]: [Check, t("success")],
      [TransactionStatusVariant.Warning]: [TriangleAlert, t("warning")],
      [TransactionStatusVariant.Error]: [ExclamationMark, t("error")],
    } satisfies Record<TransactionStatusVariant, [React.ComponentType, string]>
  )[variant]

  return (
    <STransactionStatus variant={variant}>
      <Text fw={500} fs="p4" lh={1}>
        {status}
      </Text>
      <Icon size={14} component={icon} />
    </STransactionStatus>
  )
}

export const TransactionStatusMessage: FC<
  ComponentProps<typeof STransactionStatusMessage> & {
    readonly variant: TransactionStatusVariant
  }
> = ({ ...props }) => {
  return <STransactionStatusMessage fs="p5" lh={1.4} {...props} />
}
