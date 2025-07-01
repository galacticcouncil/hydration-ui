import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import Skeleton from "react-loading-skeleton"

type Props = {
  readonly variant?: "default" | "highlight"
  readonly label: string
  readonly balance: string
  readonly value: string
  readonly isLoading?: boolean
}

export const CurrentDepositBalance: FC<Props> = ({
  variant = "default",
  label,
  balance,
  value,
  isLoading,
}) => {
  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text
        fw={500}
        fs={14}
        lh="1"
        color={variant === "default" ? "basic400" : "brightBlue300"}
      >
        {label}
      </Text>
      <div sx={{ flex: "column", gap: 4 }}>
        <Text fw={500} fs={18} lh={13} color="white">
          {balance}
        </Text>
        <Text fw={500} fs={11} lh="1.4" color="basic100">
          {isLoading ? <Skeleton width={50} height="100%" /> : value}
        </Text>
      </div>
    </div>
  )
}
