import {
  Flex,
  Modal,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AddTokenModal } from "@/modules/wallet/assets/AddToken/AddTokenModal"

type Props = {
  readonly showAllAssets: boolean
  readonly onToggleShowAllAssets: () => void
}

export const MyAssetsActions: FC<Props> = ({
  showAllAssets,
  onToggleShowAllAssets,
}) => {
  const [addModal, setAddModal] = useState(false)
  const { t } = useTranslation("wallet")

  return (
    <Flex gap={16} align="center">
      <Button size="medium" iconStart={Plus} onClick={() => setAddModal(true)}>
        {t("myAssets.header.cta")}
      </Button> */}
      <ToggleRoot>
        <ToggleLabel>{t("myAssets.header.toggle")}</ToggleLabel>
        <Toggle
          checked={showAllAssets}
          onCheckedChange={onToggleShowAllAssets}
        />
      </ToggleRoot>
      <Modal open={addModal} onOpenChange={setAddModal}>
        <AddTokenModal />
      </Modal>
    </Flex>
  )
}
