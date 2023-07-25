import { ReactComponent as MoreTabIcon } from "assets/icons/MoreTabIcon.svg"
import { Icon } from "components/Icon/Icon"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { HeaderSettingsMobile } from "../settings/mobile/HeaderSettingsMobile"
import { STabButton } from "./MobileNavBar.styled"
import { TabMenuModal } from "./TabMenuModal/TabMenuModal"
import { SQuestionmark } from "components/Layout/Header/Header.styled"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

const settingsEanbled = import.meta.env.VITE_FF_SETTINGS_ENABLED === "true"

type MoreButtonProps = { tabs: ReactNode }

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
        <div sx={{ flex: "column", color: "white", p: "8px 12px", gap: 8 }}>
          <div
            sx={{
              flex: "row",
              justify: "space-between",
              width: "calc(100% - 20px)",
            }}
          >
            {settingsEanbled && (
              <>
                <HeaderSettingsMobile />
                <Separator
                  orientation="vertical"
                  css={{ background: "rgba(158, 167, 186, 0.06)" }}
                />
              </>
            )}
            <a
              href="https://docs.hydradx.io/"
              target="blank"
              rel="noreferrer"
              sx={{ flex: "row", align: "center", gap: 10, py: 10 }}
            >
              <SQuestionmark
                sx={{
                  width: 34,
                  height: 34,
                  flex: "row",
                  align: "center",
                }}
                css={{
                  borderRadius: "9999px",
                  background: `rgba(${theme.rgbColors.darkBlue401}, 0.8)`,
                }}
              />
              <Text fs={12} color="brightBlue200">
                Docs
              </Text>
            </a>
          </div>
          {tabs}
        </div>
      </TabMenuModal>
    </>
  )
}
