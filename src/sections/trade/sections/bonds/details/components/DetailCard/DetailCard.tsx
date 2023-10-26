import { ReactNode } from "react"
import { DetailCardContainer } from "./DetailCard.styled"
import { Text } from "components/Typography/Text/Text"

export const DetailCard = ({
  label,
  icon,
  value,
}: {
  label: string
  icon: ReactNode
  value: string | ReactNode
}) => {
  return (
    <DetailCardContainer>
      <Text fs={[12, 14]} color="brightBlue300">
        {label}
      </Text>
      <div
        sx={{
          flex: ["row-reverse", "column"],
          align: ["end", "start"],
          gap: 10,
        }}
      >
        {icon}
        <Text fs={[13, 19]} font="FontOver" color="white" lh={[13, 24]}>
          {value}
        </Text>
      </div>
    </DetailCardContainer>
  )
}
