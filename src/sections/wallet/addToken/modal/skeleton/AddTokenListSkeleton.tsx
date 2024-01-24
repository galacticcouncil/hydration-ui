import Skeleton from "react-loading-skeleton"
import { AssetRow } from "sections/wallet/addToken/modal/AddTokenModal.styled"

export const AddTokenListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <AssetRow>
          <div sx={{ flex: "row", gap: 10 }}>
            <Skeleton width={20} height={20} />
            <Skeleton width={120} height={20} />
          </div>
        </AssetRow>
      ))}
    </>
  )
}
