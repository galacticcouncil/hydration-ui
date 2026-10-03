import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ExternalWalletForm } from "@/components/external/ExternalWalletForm"
import { useExternalWalletForm } from "@/components/external/ExternalWalletForm.form"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"

export const ExternalWalletContent = () => {
  const { t } = useTranslation()
  const form = useExternalWalletForm()
  const { setPage } = useWeb3ConnectContext()

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("external.viewAccount")}
        description={t("external.description")}
        align="center"
        onBack={() => setPage(Web3ConnectModalPage.Wallets)}
      />
      <ModalBody>
        <ExternalWalletForm />
      </ModalBody>
    </FormProvider>
  )
}
