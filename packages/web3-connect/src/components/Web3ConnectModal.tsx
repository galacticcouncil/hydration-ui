import { SquidSdk } from "@galacticcouncil/indexer/squid"
import { Modal } from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"

import { AccountSelectContent } from "@/components/content/AccountSelectContent"
import { ErrorContent } from "@/components/content/ErrorContent"
import { ExternalWalletContent } from "@/components/content/ExternalWalletContent"
import { ProviderSelectContent } from "@/components/content/ProviderSelectContent"
import { AccountActionsFooter } from "@/components/footer/AccountActionsFooter"
import { Web3ConnectModalPage } from "@/config/modal"
import {
  Web3ConnectContextType,
  Web3ConnectProvider,
} from "@/context/Web3ConnectContext"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"

const contentMap: Record<Web3ConnectModalPage, React.ReactNode> = {
  [Web3ConnectModalPage.ProviderSelect]: <ProviderSelectContent />,
  [Web3ConnectModalPage.ExternalWallet]: <ExternalWalletContent />,
  [Web3ConnectModalPage.AccountSelect]: <AccountSelectContent />,
  [Web3ConnectModalPage.Error]: <ErrorContent />,
}

type Props = {
  readonly squidSdk: SquidSdk
}

export const Web3ConnectModal: FC<Props> = ({ squidSdk }) => {
  const { page, setPage } = useWeb3ConnectInit()

  const { open, toggle } = useWeb3ConnectModal()

  const context = useMemo<Web3ConnectContextType>(
    () => ({ page, setPage, squidSdk }),
    [page, setPage, squidSdk],
  )

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
