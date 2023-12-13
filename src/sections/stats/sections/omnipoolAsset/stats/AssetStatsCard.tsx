import { Text } from "components/Typography/Text/Text"
import { SCardContainer } from "./AssetStatsCard.styled"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"

export const AssetStatsCard = ({
  title,
  value,
  loading,
  tooltip,
}: {
  title: string
  value?: string
  loading?: boolean
  tooltip?: string
}) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SCardContainer>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Text color="brightBlue300">{title}</Text>{" "}
        {tooltip && (
          <InfoTooltip text={tooltip}>
            <SInfoIcon />
          </InfoTooltip>
        )}
      </div>

      {loading || !value ? (
        <Skeleton width={150} height={isDesktop ? 34 : 14} />
      ) : (
        <Text fs={[14, 34]} font="FontOver" css={{ whiteSpace: "nowrap" }}>
          {value}
        </Text>
      )}
    </SCardContainer>
  )
}
