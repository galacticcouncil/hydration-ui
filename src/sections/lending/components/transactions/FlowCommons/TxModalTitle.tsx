import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"

export type TxModalTitleProps = {
  title: ReactNode
  symbol?: string
}

export const TxModalTitle = ({ title, symbol }: TxModalTitleProps) => {
  return (
    <Text fs={20} sx={{ mb: 24 }}>
      {title} {symbol ?? ""}
    </Text>
  )
}
