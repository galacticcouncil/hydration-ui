import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { format } from "date-fns"
import * as api from "api/bonds"
import { u32 } from "@polkadot/types-codec"
import { u8 } from "@polkadot/types"
import { LINKS } from "utils/navigation"
import { useLbpPool } from "api/bonds"
import { useNavigate } from "@tanstack/react-location"
import { BondListSkeleton } from "./BondListSkeleton"

type Props = {
  isLoading?: boolean
  bonds: api.Bond[]
  metas: { id: string; decimals: u32 | u8; symbol: string }[]
}

export const BondList = ({ isLoading, bonds, metas }: Props) => {
  const lbpPool = useLbpPool()
  const navigate = useNavigate()

  if (isLoading) {
    return <BondListSkeleton />
  }

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      {bonds.map((bond) => {
        const meta = metas.find((meta) => meta.id === bond.assetId)
        const date = new Date(bond.maturity)
        const pool = lbpPool?.data?.find((pool) =>
          pool.assets.some((assetId) => assetId === bond.id),
        )

        return (
          <Bond
            key={`${bond.assetId}_${bond.maturity}`}
            icon={<AssetLogo id={bond.assetId} />}
            title={`${meta?.symbol.toLocaleUpperCase()}b${format(
              date,
              "yyyyMMdd",
            )}`}
            maturity={format(date, "dd/MM/yyyy")}
            end={pool?.end}
            discount="5"
            onDetailClick={() =>
              navigate({
                to: LINKS.bond,
                search: { id: bond.id },
              })
            }
          />
        )
      })}
    </div>
  )
}
