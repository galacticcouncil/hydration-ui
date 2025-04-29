import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"

type Props = { enableAnimation?: boolean }

export const AssetSkeleton = ({ enableAnimation }: Props) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <Skeleton
        width={26}
        height={26}
        circle
        enableAnimation={enableAnimation}
      />
      {isDesktop ? (
        <Skeleton width={72} height={26} enableAnimation={enableAnimation} />
      ) : (
        <div>
          <Skeleton width={52} height={16} enableAnimation={enableAnimation} />
          <Skeleton width={52} height={12} enableAnimation={enableAnimation} />
        </div>
      )}
    </div>
  )
}
