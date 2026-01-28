import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentProps, FC, ReactNode } from "react"

import { STransactionItem } from "./TransactionItem.styled"

export type TransactionItemVariant = "default" | "success" | "error"

export const TransactionItemLabel: FC<ComponentProps<typeof Text>> = ({
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
      sx={{ gap: "xs", alignItems: "center", ...sx }}
      {...props}
    />
  )
}

type TransactionItemValueProps = ComponentProps<typeof Text> & {
  readonly variant?: TransactionItemVariant
}

export const TransactionItemValue: FC<TransactionItemValueProps> = ({
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
      sx={{ gap: "s", alignItems: "center", ...sx }}
      {...props}
    />
  )
}

type Props = {
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string | number
  readonly customValue?: ReactNode
  readonly variant?: TransactionItemVariant
  readonly className?: string
}

export const TransactionItem: FC<Props> = ({
  label,
  customLabel,
  value,
  customValue,
  variant = "default",
  className,
}) => {
  return (
    <STransactionItem className={className}>
      {customLabel ?? <TransactionItemLabel>{label}</TransactionItemLabel>}
      {customValue ?? (
        <TransactionItemValue variant={variant}>{value}</TransactionItemValue>
      )}
    </STransactionItem>
  )
}
