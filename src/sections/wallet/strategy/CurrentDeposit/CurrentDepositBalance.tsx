import { Text } from "components/Typography/Text/Text"
import { FC } from "react"

type Props = {
  readonly variant?: "default" | "highlight"
  readonly label: string
  readonly balance: string
  readonly value: string
}

export const CurrentDepositBalance: FC<Props> = ({
  variant = "default",
  label,
  balance,
  value,
}) => {
  return (
    <div sx={{ flex: "column", gap: 8 }}>
      <Text
        fw={500}
        fs={14}
        color={variant === "default" ? "basic400" : "brightBlue300"}
      >
        {label}
      </Text>
      <div sx={{ flex: "column", gap: 4 }}>
        <Text fw={500} fs={18} lh="1.3" color="white">
          {balance}
        </Text>
        <Text fw={500} fs={11} lh="1.4" color="basic100">
          {value}
        </Text>
      </div>
    </div>
  )
}
