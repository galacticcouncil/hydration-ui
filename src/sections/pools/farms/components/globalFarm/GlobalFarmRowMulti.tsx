import { u32 } from "@polkadot/types"
import { Farm, useFarmAprs, getMinAndMaxAPR } from "api/farms"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAssetMeta } from "api/assetMeta"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

const FarmAssetIcon = ({ assetId }: { assetId: u32 }) => {
  const { data: asset } = useAssetMeta(assetId)

  return <AssetLogo symbol={asset?.symbol} />
}

export const GlobalFarmRowMulti = ({ farms }: { farms: Farm[] }) => {
  const { t } = useTranslation()
  const farmAprs = useFarmAprs(farms)

  if (!farmAprs.data) return null

  return (
    <div sx={{ flex: "row", justify: "space-between", gap: 4 }}>
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
