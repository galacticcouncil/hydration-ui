import { ChevronRight, LogOut } from "@galacticcouncil/ui/assets/icons"
import { Button, Modal, ModalFooter } from "@galacticcouncil/ui/components"

import { Web3ConnectAccountSelect } from "@/components/Web3ConnectAccountSelect"
import { Web3ConnectError } from "@/components/Web3ConnectError"
import { Web3ConnectProviderSelect } from "@/components/Web3ConnectProviderSelect"
import { Web3ConnectModalPage } from "@/config/modal"
import { useAccount } from "@/hooks/useAccount"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"

export const Web3ConnectModal = () => {
  const { page, setPage } = useWeb3ConnectInit()

  const { open, toggle } = useWeb3ConnectModal()

  const { account, disconnect } = useAccount()

  const onLogout = () => {
    disconnect()
    toggle()
  }

  return (
    <Modal open={open} onOpenChange={() => toggle()} disableInteractOutside>
      {page === Web3ConnectModalPage.ProviderSelect && (
        <Web3ConnectProviderSelect
          onLastConnectedClick={() =>
            setPage(Web3ConnectModalPage.AccountSelect)
          }
        />
      )}
      {page === Web3ConnectModalPage.AccountSelect && (
        <Web3ConnectAccountSelect />
      )}
      {page === Web3ConnectModalPage.Error && <Web3ConnectError />}
      {page !== Web3ConnectModalPage.ProviderSelect && (
        <ModalFooter justify="end">
          {account && (
            <Button variant="tertiary" iconEnd={LogOut} onClick={onLogout}>
              Log out
            </Button>
          )}
          <Button
            variant="tertiary"
            iconEnd={ChevronRight}
            onClick={() => setPage(0)}
          >
            Manage wallets
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
