import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"
import { SRightSide } from "./Row.styled"

type RowProps = {
  left: string
  right: ReactNode
}

export const Row: FC<RowProps> = ({ left, right }) => (
  <div
    sx={{
      flex: "row",
      justify: "space-between",
      align: "center",
      mb: 6,
      mt: 6,
    }}
  >
    <Text fs={12} lh={22} fw={400} color="neutralGray300">
      {left}
    </Text>
    <SRightSide>{right}</SRightSide>
  </div>
)
