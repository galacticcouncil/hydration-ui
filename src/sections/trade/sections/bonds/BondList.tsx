import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { format } from "date-fns"
import * as api from "api/bonds"
import { u32 } from "@polkadot/types-codec"
import { u8 } from "@polkadot/types"
import { Text } from "components/Typography/Text/Text"

type Props = {
  isLoading?: boolean
  bonds: api.Bond[]
  metas: { id: string; decimals: u32 | u8; symbol: string }[]
}

export const BondList = ({ isLoading, bonds, metas }: Props) => {
  if (isLoading) {
    return (
      <>
        <Text color="white">loading</Text>
      </>
    )
  }

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      {bonds.map((bond) => {
        const meta = metas.find((meta) => meta.id === bond.assetId)
        const date = new Date(bond.maturity)

        return (
          <Bond
            key={`${bond.assetId}_${bond.maturity}`}
            icon={<AssetLogo id={bond.assetId} />}
            title={`${meta?.symbol.toLocaleUpperCase()}b${format(
              date,
              "yyyyMMdd",
            )}`}
            maturity={format(date, "dd/MM/yyyy")}
            endingIn="23H 22m"
            discount="5"
            onDetailClick={console.log}
          />
        )
      })}
    </div>
  )
}
