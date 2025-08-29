import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"

export type TReceiveAsset = {
  asset: TAssetData
  value: string
}

export const RecieveAssets = ({ assets }: { assets: TReceiveAsset[] }) => {
  const { t } = useTranslation("common")

  return (
    <Flex
      direction="column"
      gap={12}
      p={getTokenPx("containers.paddings.tertiary")}
      sx={{
        borderRadius: getTokenPx("containers.cornerRadius.internalPrimary"),
        backgroundColor: getToken("surfaces.containers.dim.dimOnHigh"),
      }}
    >
      {assets.map((asset) => (
        <Flex
          key={asset.asset.id}
          gap={12}
          justify="space-between"
          align="center"
        >
          <AssetLabelFull asset={asset.asset} withName={false} size="large" />
          <Text fw={600} color={getToken("text.high")} fs="p2">
            {t("number", { value: asset.value })}
          </Text>
        </Flex>
      ))}
    </Flex>
  )
}
