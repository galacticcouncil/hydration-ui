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
import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"

const contentMap: Record<Web3ConnectModalPage, React.ReactNode> = {
  [Web3ConnectModalPage.ProviderSelect]: <ProviderSelectContent />,
  [Web3ConnectModalPage.ExternalWallet]: <ExternalWalletContent />,
  [Web3ConnectModalPage.AccountSelect]: <AccountSelectContent />,
  [Web3ConnectModalPage.Error]: <ErrorContent />,
}

type ControlledProps = {
  readonly squidSdk: SquidSdk
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onAccountSelect: (account: Account) => void
}

type UncontrolledProps = {
  readonly squidSdk: SquidSdk
}

type Props = ControlledProps | UncontrolledProps

export const Web3ConnectModal: FC<Props> = (props) => {
  const { squidSdk } = props

  const isControlled =
    "open" in props && "onOpenChange" in props && "onAccountSelect" in props

  const { page, setPage } = useWeb3ConnectInit({
    eagerEnable: !isControlled,
  })

  const modalState = useWeb3ConnectModal()
  const setAccount = useWeb3Connect((state) => state.setAccount)

  const open = isControlled ? props.open : modalState.open
  const onOpenChange = isControlled
    ? props.onOpenChange
    : () => modalState.toggle()
  const onAccountSelect = isControlled ? props.onAccountSelect : setAccount

  const context = useMemo<Web3ConnectContextType>(
    () => ({
      isControlled,
      page,
      setPage,
      squidSdk,
      onAccountSelect,
    }),
    [page, setPage, squidSdk, onAccountSelect, isControlled],
  )

  return (
    <Modal open={open} onOpenChange={onOpenChange} disableInteractOutside>
      <Web3ConnectProvider value={context}>
        {contentMap[page]}
        {page !== Web3ConnectModalPage.ProviderSelect && (
          <AccountActionsFooter />
        )}
      </Web3ConnectProvider>
    </Modal>
  )
}
