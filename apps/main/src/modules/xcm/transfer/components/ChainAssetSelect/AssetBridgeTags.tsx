import { Chip, Flex } from "@galacticcouncil/ui/components"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useTranslation } from "react-i18next"

import { XcmTag, XcmTags } from "@/states/transactions"

export type AssetBridgeTagsProps = {
  route: AssetRoute
}

export const AssetBridgeTags: React.FC<AssetBridgeTagsProps> = ({ route }) => {
  const { t } = useTranslation(["xcm"])

  const tags = (route?.tags ?? []) as XcmTags

  if (!tags.length) return null

  return (
    <Flex align="center" gap="s" mt="xs">
      {tags.includes(XcmTag.Wormhole) && (
        <Chip variant="info" size="small">
          {t("xcm:bridge.wormhole")}
        </Chip>
      )}
      {tags.includes(XcmTag.Snowbridge) && (
        <Chip variant="info" size="small">
          {t("xcm:bridge.snowbridge")}
        </Chip>
      )}
    </Flex>
  )
}
