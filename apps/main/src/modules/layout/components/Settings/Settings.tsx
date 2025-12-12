import { Settings as SettingsIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Icon,
  ModalContent,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SettingsModal } from "@/modules/layout/components/Settings/SettingsModal"

export const Settings: FC = () => (
  <ModalRoot>
    <ModalTrigger asChild>
      <ButtonIcon>
        <Icon component={SettingsIcon} size={20} />
      </ButtonIcon>
    </ModalTrigger>
    <ModalContent>
      <SettingsModal />
    </ModalContent>
  </ModalRoot>
)
