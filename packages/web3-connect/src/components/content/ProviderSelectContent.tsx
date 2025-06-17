import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"

import { ProviderSelect } from "@/components/provider/ProviderSelect"

export const ProviderSelectContent = () => {
  return (
    <>
      <ModalHeader title="Connect wallet" />
      <ModalBody>
        <ProviderSelect />
      </ModalBody>
    </>
  )
}
