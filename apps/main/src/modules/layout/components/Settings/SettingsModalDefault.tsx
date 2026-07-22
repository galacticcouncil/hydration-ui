import { ModalBody } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"

import { Contacts } from "@/modules/layout/components/Settings/Contacts"
import { DocsLink } from "@/modules/layout/components/Settings/DocsLink"
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
          <DocsLink />
        </SSettingsSection>
      </SSettingsContent>
    </ModalBody>
  )
}
