import { Settings as SettingsIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ModalBody,
  ModalContent,
  ModalContentDivider,
  ModalHeader,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Contacts } from "@/modules/layout/components/Settings/Contacts"
import { DarkMode } from "@/modules/layout/components/Settings/DarkMode"
import { DegenMode } from "@/modules/layout/components/Settings/DegenMode"
import { PaymentAsset } from "@/modules/layout/components/Settings/PaymentAsset"
import {
  SSettingsContentDesktop,
  SSettingsSection,
} from "@/modules/layout/components/Settings/Settings.styled"

export const Settings: FC = () => {
  const { t } = useTranslation()

  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <ButtonIcon>
          <SettingsIcon size={19} />
        </ButtonIcon>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader
          title={t("settings")}
          customTitle={
            <ModalTitle sx={{ textAlign: "center" }}>
              {t("settings")}
            </ModalTitle>
          }
        />
        <ModalBody sx={{ padding: 0 }}>
          <SSettingsContentDesktop>
            <SSettingsSection>
              <PaymentAsset />
              <Contacts />
            </SSettingsSection>
            <ModalContentDivider />
            <SSettingsSection>
              <DegenMode />
              <DarkMode />
            </SSettingsSection>
          </SSettingsContentDesktop>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  )
}
