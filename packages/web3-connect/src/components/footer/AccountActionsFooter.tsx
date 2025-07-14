import { ChevronRight, LogOut } from "@galacticcouncil/ui/assets/icons"
import { Button, ModalFooter } from "@galacticcouncil/ui/components"

import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount, useWeb3ConnectModal } from "@/hooks"

export const AccountActionsFooter = () => {
  const { setPage } = useWeb3ConnectContext()
  const { toggle } = useWeb3ConnectModal()
  const { account, disconnect } = useAccount()

  const onLogout = () => {
    disconnect()
    toggle()
  }
  return (
    <ModalFooter justify="end">
      {account && (
        <Button variant="tertiary" onClick={onLogout}>
          Log out
          <LogOut />
        </Button>
      )}
      <Button
        variant="tertiary"
        onClick={() => setPage(Web3ConnectModalPage.ProviderSelect)}
      >
        Manage wallets
        <ChevronRight />
      </Button>
    </ModalFooter>
  )
}
