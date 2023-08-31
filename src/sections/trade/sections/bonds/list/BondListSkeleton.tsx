import Skeleton from "react-loading-skeleton"

export const BondListSkeleton = () => (
  <>
    <Skeleton width="100%" height={90} sx={{ mb: 12 }} />
    <Skeleton width="100%" height={90} sx={{ mb: 40 }} />
  </>
)
