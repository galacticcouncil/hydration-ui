import { ReactNode } from "react"
import { DetailCardContainer } from "./DetailCard.styled"
import { Text } from "components/Typography/Text/Text"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

export const DetailCard = ({
  label,
  value,
  tooltip,
}: {
  label: string
  value: string | ReactNode
  tooltip?: string
}) => {
  return (
    <DetailCardContainer
      sx={{
        p: ["14px 20px", typeof value === "string" ? "20px 20px 26px" : 20],
      }}
    >
      <div sx={{ flex: "row", gap: 4 }}>
        <Text fs={[12, 14]} color="brightBlue300">
          {label}
        </Text>
        {tooltip && (
          <InfoTooltip text={tooltip}>
            <SInfoIcon />
          </InfoTooltip>
        )}
      </div>

      <div
        sx={{
          flex: ["row-reverse", "column"],
          align: ["end", "start"],
          gap: 10,
        }}
      >
        {typeof value === "string" ? (
          <Text fs={[13, 15]} color="white" lh={[13, 15]}>
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </DetailCardContainer>
  )
}
