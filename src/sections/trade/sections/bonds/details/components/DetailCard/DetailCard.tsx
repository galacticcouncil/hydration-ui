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
      <Text fs={14} color="white">
        {label}
      </Text>
      <div sx={{ flex: "column", gap: 10 }}>
        {icon}
        <Text fs={24} color="brightBlue300">
          {value}
        </Text>
      </div>
    </DetailCardContainer>
  )
}
