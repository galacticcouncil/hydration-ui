import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"

import { ProviderSelect } from "@/components/provider/ProviderSelect"
import { useWeb3ConnectModal } from "@/hooks"

export const ProviderSelectContent = () => {
  const { meta } = useWeb3ConnectModal()
  return (
    <>
      <ModalHeader
        title={meta?.title ?? "Connect wallet"}
        description={meta?.description}
      />
      <ModalBody>
        <ProviderSelect />
      </ModalBody>
    </>
  )
}
