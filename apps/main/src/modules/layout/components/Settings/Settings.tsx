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
import { useRpcProvider } from "@/providers/rpcProvider"

export const Settings: FC = () => {
  const { isLoaded } = useRpcProvider()
  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <ButtonIcon disabled={!isLoaded}>
          <Icon component={SettingsIcon} size="l" />
        </ButtonIcon>
      </ModalTrigger>
      <ModalContent>
        <SettingsModal />
      </ModalContent>
    </ModalRoot>
  )
}
