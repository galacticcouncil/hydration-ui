import { Modal } from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import { AccountSelectContent } from "@/components/content/AccountSelectContent"
import { ErrorContent } from "@/components/content/ErrorContent"
import { ExternalWalletContent } from "@/components/content/ExternalWalletContent"
import { ProviderSelectContent } from "@/components/content/ProviderSelectContent"
import { AccountActionsFooter } from "@/components/footer/AccountActionsFooter"
import { Web3ConnectModalPage } from "@/config/modal"
import { Web3ConnectProvider } from "@/context/Web3ConnectContext"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"

const contentMap: Record<Web3ConnectModalPage, React.ReactNode> = {
  [Web3ConnectModalPage.ProviderSelect]: <ProviderSelectContent />,
  [Web3ConnectModalPage.ExternalWallet]: <ExternalWalletContent />,
  [Web3ConnectModalPage.AccountSelect]: <AccountSelectContent />,
  [Web3ConnectModalPage.Error]: <ErrorContent />,
}

export const Web3ConnectModal = () => {
  const { page, setPage } = useWeb3ConnectInit()

  const { open, toggle } = useWeb3ConnectModal()

  const context = useMemo(() => ({ page, setPage }), [page, setPage])

  return (
    <Modal open={open} onOpenChange={() => toggle()} disableInteractOutside>
      <Web3ConnectProvider value={context}>
        {contentMap[page]}
        {page !== Web3ConnectModalPage.ProviderSelect && (
          <AccountActionsFooter />
        )}
      </Web3ConnectProvider>
    </Modal>
  )
}
