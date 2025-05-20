import { ExclamationMark } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { InvalidAssetModal } from "@/modules/wallet/assets/Invalid/InvalidAssetModal"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly origin: string
}

// TODO remove everything related to invalid assets if we decide to not use them
export const InvalidAssetRow: FC<Props> = ({ assetId, origin }) => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()

  const [isModalOpen, setIsModalOpen] = useState(false)

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
          {t("invalidAsset.description")}
        </Text>
      )}
      <Button variant="danger" outline onClick={() => setIsModalOpen(true)}>
        <ExclamationMark />
        {t("invalidAsset.cta")}
      </Button>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <InvalidAssetModal assetId={assetId} origin={origin} />
      </Modal>
    </Flex>
  )
}
