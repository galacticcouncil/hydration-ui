import { ComponentProps, FC, ReactNode } from "react"

import { Text } from "@/components/Text"
import { STransactionListItem } from "@/components/TransactionListItem/TransactionListItem.styled"
import { getToken } from "@/utils"

type TransactionListItemVariant = "default" | "success" | "error"

export const TransactionListItemLabel: FC<ComponentProps<typeof Text>> = ({
  sx,
  ...props
}) => {
  return (
    <Text
      fw={400}
      fs="p5"
      lh={1.4}
      color={getToken("text.medium")}
      display="flex"
      sx={{ gap: 2, alignItems: "center", ...sx }}
      {...props}
    />
  )
}

type TransactionListItemValueProps = ComponentProps<typeof Text> & {
  variant?: TransactionListItemVariant
}

export const TransactionListItemValue: FC<TransactionListItemValueProps> = ({
  variant = "default",
  sx,
  ...props
}) => {
  const color = (() => {
    switch (variant) {
      case "success":
        return getToken("accents.success.emphasis")
      case "error":
        return getToken("accents.danger.secondary")
      default:
        return getToken("text.high")
    }
  })()

  return (
    <Text
      fw={500}
      fs="p5"
      lh={1.2}
      color={color}
      display="flex"
      sx={{ gap: 7, alignItems: "center", ...sx }}
      {...props}
    />
  )
}

type Props = {
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string | number
  readonly customValue?: ReactNode
}

export const TransactionListItem: FC<Props> = ({
  label,
  customLabel,
  value,
  customValue,
}) => {
  return (
    <STransactionListItem>
      {customLabel ?? (
        <TransactionListItemLabel>{label}</TransactionListItemLabel>
      )}
      {customValue ?? (
        <TransactionListItemValue>{value}</TransactionListItemValue>
      )}
    </STransactionListItem>
  )
}
