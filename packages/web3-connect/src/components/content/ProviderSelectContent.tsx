import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"

import { ProviderSelect } from "@/components/provider/ProviderSelect"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks"

export const ProviderSelectContent = () => {
  const { isConnected } = useAccount()
  const { setPage } = useWeb3ConnectContext()
  return (
    <>
      <ModalHeader
        title="Connect wallet"
        align="center"
        onBack={
          isConnected
            ? () => setPage(Web3ConnectModalPage.AccountSelect)
            : undefined
        }
      />
      <ModalBody scrollable={false}>
        <ProviderSelect />
      </ModalBody>
    </>
  )
}
