import { ModalBody, ModalContentDivider } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"

import { Contacts } from "@/modules/layout/components/Settings/Contacts"
import { DarkMode } from "@/modules/layout/components/Settings/DarkMode"
import { DegenMode } from "@/modules/layout/components/Settings/DegenMode"
import { PaymentAsset } from "@/modules/layout/components/Settings/PaymentAsset"
import {
  SSettingsContent,
  SSettingsSection,
} from "@/modules/layout/components/Settings/Settings.styled"

type Props = {
  readonly onPaymentAssetClick: () => void
  readonly onContactsClick: () => void
}

export const SettingsModalDefault: FC<Props> = ({
  onPaymentAssetClick,
  onContactsClick,
}) => {
  const { isConnected } = useAccount()

  return (
    <ModalBody sx={{ padding: 0 }}>
      <SSettingsContent>
        <SSettingsSection>
          {isConnected && <PaymentAsset onClick={onPaymentAssetClick} />}
          <Contacts onClick={onContactsClick} />
        </SSettingsSection>
        <ModalContentDivider />
        <SSettingsSection>
          <DegenMode />
          <DarkMode />
        </SSettingsSection>
      </SSettingsContent>
    </ModalBody>
  )
}
