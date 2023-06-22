import { ReactComponent as MoreTabIcon } from "assets/icons/MoreTabIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Spacer } from "components/Spacer/Spacer"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { HeaderSettingsMobile } from "../settings/mobile/HeaderSettingsMobile"
import { STabButton } from "./MobileNavBar.styled"
import { TabMenuModal } from "./TabMenuModal/TabMenuModal"

type MoreButtonProps = {
  tabs: ReactNode
}

export const MoreButton = ({ tabs }: MoreButtonProps) => {
  const { t } = useTranslation()
  const [openModal, setOpenModal] = useState(false)

  return (
    <>
      <STabButton active={openModal} onClick={() => setOpenModal(true)}>
        <Icon size={20} icon={<MoreTabIcon />} />
        {t("header.more")}
      </STabButton>
      <TabMenuModal open={openModal} onClose={() => setOpenModal(false)}>
        <div sx={{ flex: "column", color: "white", px: 12, pb: 12, gap: 8 }}>
          <Spacer size={4} />
          <HeaderSettingsMobile />
          <Spacer size={14} />
          {tabs}
        </div>
      </TabMenuModal>
    </>
  )
}
