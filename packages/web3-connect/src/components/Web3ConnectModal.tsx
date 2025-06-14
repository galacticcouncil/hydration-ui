import { ChevronRight, LogOut } from "@galacticcouncil/ui/assets/icons"
import { Button, Modal, ModalFooter } from "@galacticcouncil/ui/components"

import { AccountSelectContent } from "@/components/content/AccountSelectContent"
import { ErrorContent } from "@/components/content/ErrorContent"
import { ExternalWalletContent } from "@/components/content/ExternalWalletContent"
import { ProviderSelectContent } from "@/components/content/ProviderSelectContent"
import { Web3ConnectContext } from "@/components/context/Web3ConnectContext"
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

  const renderContent = () => {
    switch (page) {
      case Web3ConnectModalPage.ProviderSelect:
        return <ProviderSelectContent />
      case Web3ConnectModalPage.ExternalWallet:
        return <ExternalWalletContent />
      case Web3ConnectModalPage.AccountSelect:
        return <AccountSelectContent />
      case Web3ConnectModalPage.Error:
        return <ErrorContent />
    }
  }

  return (
    <Modal open={open} onOpenChange={() => toggle()} disableInteractOutside>
      <Web3ConnectContext.Provider value={{ page, setPage }}>
        {renderContent()}
        {page !== Web3ConnectModalPage.ProviderSelect && (
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
        )}
      </Web3ConnectContext.Provider>
    </Modal>
  )
}
