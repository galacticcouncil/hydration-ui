import Skeleton from "react-loading-skeleton"
import { SAssetRow } from "./AssetsModalRow.styled"

export const AssetsModalRowSkeleton = () => {
  return (
    <SAssetRow isSelected={false}>
      <div sx={{ flex: "row", align: "center", gap: 10 }}>
        <Skeleton width={30} height={30} circle />
        <div sx={{ flex: "column", gap: 2 }}>
          <Skeleton width={56} height={16} />
          <Skeleton width={128} height={12} />
        </div>
      </div>
      <div sx={{ flex: "column", align: "end", gap: 2 }}>
        <Skeleton width={128} height={14} />
        <Skeleton width={40} height={12} />
      </div>
    </SAssetRow>
  )
}
