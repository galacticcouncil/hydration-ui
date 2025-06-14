import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"

import { ExternalWalletForm } from "@/components/external/ExternalWalletForm"

export const ExternalWalletContent = () => {
  return (
    <>
      <ModalHeader
        title="View external account"
        description="Paste account address you would like to monitor."
      />
      <ModalBody>
        <ExternalWalletForm />
      </ModalBody>
    </>
  )
}
