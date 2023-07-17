import { Text } from "components/Typography/Text/Text"
import { SCardContainer } from "./AssetStatsCard.styled"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"

export const AssetStatsCard = ({
  title,
  value,
  loading,
}: {
  title: string
  value?: string
  loading?: boolean
}) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <SCardContainer>
      <Text color="brightBlue300">{title}</Text>
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
