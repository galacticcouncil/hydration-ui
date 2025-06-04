import { Settings as SettingsIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  ModalBody,
  ModalContent,
  ModalContentDivider,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { Contacts } from "@/modules/layout/components/Settings/Contacts"
import { DarkMode } from "@/modules/layout/components/Settings/DarkMode"
import { DegenMode } from "@/modules/layout/components/Settings/DegenMode"
import { PaymentAsset } from "@/modules/layout/components/Settings/PaymentAsset"
import {
  SSettingsContentDesktop,
  SSettingsSection,
} from "@/modules/layout/components/Settings/Settings.styled"
import { TransactionFeePaymentAssetModalContent } from "@/modules/transactions/TransactionFeePaymentAssetModal"

enum SettingsModalPage {
  Default = "Default",
  PaymentAsset = "PaymentAsset",
}

export const SettingsContent = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState<SettingsModalPage>(SettingsModalPage.Default)
  const { isConnected } = useAccount()

  const renderContent = () => {
    switch (page) {
      case SettingsModalPage.PaymentAsset:
        return (
          <TransactionFeePaymentAssetModalContent
            onSubmitted={() => setPage(SettingsModalPage.Default)}
          />
        )
      default:
        return (
          <SSettingsContentDesktop>
            <SSettingsSection>
              {isConnected && (
                <PaymentAsset
                  onClick={() => setPage(SettingsModalPage.PaymentAsset)}
                />
              )}
              <Contacts />
            </SSettingsSection>
            <ModalContentDivider />
            <SSettingsSection>
              <DegenMode />
              <DarkMode />
            </SSettingsSection>
          </SSettingsContentDesktop>
        )
    }
  }

  const getTitle = () => {
    switch (page) {
      case SettingsModalPage.PaymentAsset:
        return t("paymentAsset")
      default:
        return t("settings")
    }
  }

  return (
    <>
      <ModalHeader
        title={getTitle()}
        align="center"
        onBack={() => setPage(SettingsModalPage.Default)}
      />
      <ModalBody sx={{ padding: 0 }}>{renderContent()}</ModalBody>
    </>
  )
}

export const Settings: FC = () => (
  <ModalRoot>
    <ModalTrigger asChild>
      <ButtonIcon>
        <SettingsIcon size={19} />
      </ButtonIcon>
    </ModalTrigger>
    <ModalContent>
      <SettingsContent />
    </ModalContent>
  </ModalRoot>
)
