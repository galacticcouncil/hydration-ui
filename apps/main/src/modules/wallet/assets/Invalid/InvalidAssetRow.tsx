import { ExclamationMark } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull, AssetLabelFullMobile } from "@/components"
import { InvalidAssetModal } from "@/modules/wallet/assets/Invalid/InvalidAssetModal"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly origin: string
}

export const InvalidAssetRow: FC<Props> = ({ assetId, origin }) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  return (
    <Flex justify="space-between" align="center" height="100%">
      {asset &&
        (isMobile ? (
          <AssetLabelFullMobile asset={asset} />
        ) : (
          <AssetLabelFull asset={asset} />
        ))}
      {!isMobile && (
        <Text
          fs="p4"
          lh={1.5}
          fw={500}
          color={getToken("colors.utility.warningSecondary.400")}
        >
          {t("invalidAsset.description")}
        </Text>
      )}
      <Button
        variant="danger"
        outline
        iconStart={ExclamationMark}
        onClick={() => setIsModalOpen(true)}
      >
        {t("invalidAsset.cta")}
      </Button>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <InvalidAssetModal assetId={assetId} origin={origin} />
      </Modal>
    </Flex>
  )
}
