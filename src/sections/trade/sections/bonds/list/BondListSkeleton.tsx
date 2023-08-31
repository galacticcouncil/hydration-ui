import { BondSkeleton } from "components/Bond/BondSkeleton"

export const BondListSkeleton = () => (
  <div sx={{ flex: "column", gap: 12 }}>
    <BondSkeleton />
    <BondSkeleton />
  </div>
)
