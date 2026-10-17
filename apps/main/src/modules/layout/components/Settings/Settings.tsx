import { Settings as SettingsIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ModalContent,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { SettingsModal } from "@/modules/layout/components/Settings/SettingsModal"
import { useRpcProvider } from "@/providers/rpcProvider"

export const Settings: FC = () => {
  const { isReady } = useRpcProvider()
  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <Button
          icon={SettingsIcon}
          variant="ghost"
          size="medium"
          disabled={!isReady}
        />
      </ModalTrigger>
      <ModalContent>
        <SettingsModal />
      </ModalContent>
    </ModalRoot>
  )
}
