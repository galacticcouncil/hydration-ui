import { ExclamationMark } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { useAssets } from "@/providers/assetsProvider"
type Props = {
  readonly assetId: string
}

export const InvalidAssetRow: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()

  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  return (
    <Flex justify="space-between" align="center" height="100%">
      {asset && <AssetLabelFull asset={asset} withName={!isMobile} />}
      {!isMobile && (
        <Text
          fs="p4"
          lh={1.5}
          fw={500}
          color={getToken("colors.utility.warningSecondary.400")}
        >
          {t("myAssets.asset.invalid.description")}
        </Text>
      )}
      <Button variant="danger" outline iconStart={ExclamationMark}>
        {t("myAssets.asset.invalid.cta")}
      </Button>
    </Flex>
  )
}
