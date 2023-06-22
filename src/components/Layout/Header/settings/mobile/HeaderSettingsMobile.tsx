import { ReactComponent as IconSettings } from "assets/icons/IconSettings.svg"
import { IconButton } from "components/IconButton/IconButton"
import { Modal } from "components/Modal/Modal"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { HeaderSettingsContents } from "../HeaderSettings"

export const HeaderSettingsMobile = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div sx={{ flex: "row", align: "center", gap: 10 }}>
        <IconButton
          onClick={() => setOpen(true)}
          icon={<IconSettings />}
          sx={{ color: "brightBlue100" }}
          round
        />
        <Text fs={12} fw={500} color="brightBlue200">
          {t("header.settings.title")}
        </Text>
      </div>
      <Modal open={open}>
        <HeaderSettingsContents onClose={() => setOpen(false)} />
      </Modal>
    </>
  )
}
