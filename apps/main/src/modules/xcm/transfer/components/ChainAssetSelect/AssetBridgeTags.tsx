import { Chip, Flex } from "@galacticcouncil/ui/components"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import {
  getPrimaryBridgeTag,
  isSnowbridgeRoute,
  isWormholeFamilyTag,
} from "@/modules/xcm/transfer/utils/bridge"

export type AssetBridgeTagsProps = {
  route: AssetRoute
}

export const AssetBridgeTags: React.FC<AssetBridgeTagsProps> = ({ route }) => {
  const { t } = useTranslation(["xcm"])

  const primaryTag = getPrimaryBridgeTag(route)
  const showSnowbridge = isSnowbridgeRoute(route)
  const showWormhole = !showSnowbridge && isWormholeFamilyTag(primaryTag)

  if (!showSnowbridge && !showWormhole) return null

  return (
    <Flex align="center" gap="s" mt="xs">
      {showWormhole && (
        <Chip variant="info" size="small">
          {t("xcm:bridge.wormhole")}
        </Chip>
      )}
      {showSnowbridge && (
        <Chip variant="info" size="small">
          {t("xcm:bridge.snowbridge")}
        </Chip>
      )}
    </Flex>
  )
}
