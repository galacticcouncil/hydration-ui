import {
  Drawer,
  DrawerBody,
  ModalContentDivider,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Contacts } from "@/modules/layout/components/Settings/Contacts"
import { DarkMode } from "@/modules/layout/components/Settings/DarkMode"
import { DegenMode } from "@/modules/layout/components/Settings/DegenMode"
import { PaymentAsset } from "@/modules/layout/components/Settings/PaymentAsset"
import {
  SSettingsContentMobile,
  SSettingsSection,
} from "@/modules/layout/components/Settings/Settings.styled"

type Props = {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export const MobileTabBarSettings: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  return (
    <Drawer title={t("settings")} open={isOpen} onOpenChange={onClose}>
      <DrawerBody sx={{ padding: 0 }}>
        <SSettingsContentMobile>
          <SSettingsSection>
            <PaymentAsset />
            <Contacts />
          </SSettingsSection>
          <ModalContentDivider />
          <SSettingsSection>
            <DegenMode />
            <DarkMode />
          </SSettingsSection>
        </SSettingsContentMobile>
      </DrawerBody>
    </Drawer>
  )
}
