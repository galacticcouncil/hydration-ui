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
import { TutorialAnchor } from "@/modules/tutorials/TutorialAnchor"
import { useRpcProvider } from "@/providers/rpcProvider"

export const Settings: FC = () => {
  const { isReady } = useRpcProvider()
  return (
    <ModalRoot>
      <TutorialAnchor tutorial="settings-avatar" asChild>
        <ModalTrigger asChild>
          <ButtonIcon disabled={!isReady}>
            <Icon component={SettingsIcon} size="l" />
          </ButtonIcon>
        </ModalTrigger>
      </TutorialAnchor>
      <ModalContent>
        <SettingsModal />
      </ModalContent>
    </ModalRoot>
  )
}
