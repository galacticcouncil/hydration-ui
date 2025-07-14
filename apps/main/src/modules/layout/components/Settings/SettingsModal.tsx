import { ModalHeader } from "@galacticcouncil/ui/components"
import { AddressBookModal } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { SettingsModalDefault } from "@/modules/layout/components/Settings/SettingsModalDefault"
import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"

enum SettingsModalPage {
  Default = "Default",
  PaymentAsset = "PaymentAsset",
  Contacts = "Contacts",
}

export const SettingsModal = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState<SettingsModalPage>(SettingsModalPage.Default)

  switch (page) {
    case SettingsModalPage.PaymentAsset:
      return (
        <>
          <ModalHeader
            title={t("paymentAsset")}
            align="center"
            onBack={() => setPage(SettingsModalPage.Default)}
          />
          <TransactionFeePaymentAssetModal
            onSubmitted={() => setPage(SettingsModalPage.Default)}
          />
        </>
      )

    case SettingsModalPage.Contacts:
      return (
        <AddressBookModal
          align="center"
          header={
            <ModalHeader
              title={t("contacts")}
              align="center"
              onBack={() => setPage(SettingsModalPage.Default)}
            />
          }
        />
      )

    default:
      return (
        <>
          <ModalHeader title={t("settings")} align="center" />
          <SettingsModalDefault
            onPaymentAssetClick={() => setPage(SettingsModalPage.PaymentAsset)}
            onContactsClick={() => setPage(SettingsModalPage.Contacts)}
          />
        </>
      )
  }
}
