import { u32 } from "@polkadot/types"
import { Farm, useFarmAprs, getMinAndMaxAPR } from "api/farms"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useRpcProvider } from "providers/rpcProvider"

const FarmAssetIcon = ({ assetId }: { assetId: u32 }) => {
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(assetId.toString())

  return <AssetLogo id={asset.id} />
}

export const GlobalFarmRowMulti = ({
  farms,
  short,
}: {
  farms: Farm[]
  short?: boolean
}) => {
  const { t } = useTranslation()
  const farmAprs = useFarmAprs(farms)

  if (!farmAprs.data) return null

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <div sx={{ flex: "row" }}>
        <MultipleIcons
          icons={farmAprs.data.map((farm) => ({
            icon: (
              <FarmAssetIcon
                key={farm.assetId.toString()}
                assetId={farm.assetId}
              />
            ),
          }))}
        />
      </div>
      {!!farmAprs.data && (
        <Text color="brightBlue200">
          {t(`value.multiAPR`, getMinAndMaxAPR(farmAprs))}
        </Text>
      )}
    </div>
  )
}
