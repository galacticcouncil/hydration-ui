import { LinkTextButton, Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { SInvalidAssetHeader } from "@/modules/wallet/assets/Invalid/InvalidAssetModalHeader.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly origin: string
}

export const InvalidAssetModalHeader: FC<Props> = ({ assetId, origin }) => {
  const { t } = useTranslation("wallet")

  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  return (
    <Flex direction="column" gap={12}>
      <SInvalidAssetHeader>
        {asset && <AssetLabelFull size="large" asset={asset} />}
        {/* TODO add link for asset */}
        <LinkTextButton href="">
          {t("invalidAsset.modal.checkOnChain", {
            origin,
          })}
        </LinkTextButton>
      </SInvalidAssetHeader>
      <Text fs={12} lh={1.2} fw={500} color={getToken("text.medium")}>
        {t("invalidAsset.modal.dataPreview")}
      </Text>
    </Flex>
  )
}
