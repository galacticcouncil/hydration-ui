import Skeleton from "react-loading-skeleton"

type Props = { enableAnimation?: boolean }

export const CellSkeleton = ({ enableAnimation }: Props) => (
  <div sx={{ flex: "row", justify: "center" }}>
    <Skeleton width={72} height={26} enableAnimation={enableAnimation} />
  </div>
)
