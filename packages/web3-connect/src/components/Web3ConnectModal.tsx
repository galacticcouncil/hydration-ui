import { SquidSdk } from "@galacticcouncil/indexer/squid"
import { Modal } from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

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
import { useWalletSubscriptions } from "@/hooks/useWalletSubscriptions"
import { Account, useWeb3Connect, WalletMode } from "@/hooks/useWeb3Connect"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { useWeb3EagerEnable } from "@/hooks/useWeb3EagerEnable"

const contentMap: Record<Web3ConnectModalPage, React.ReactNode> = {
  [Web3ConnectModalPage.ProviderSelect]: <ProviderSelectContent />,
  [Web3ConnectModalPage.ExternalWallet]: <ExternalWalletContent />,
  [Web3ConnectModalPage.AccountSelect]: <AccountSelectContent />,
  [Web3ConnectModalPage.Error]: <ErrorContent />,
}

type ControlledProps = {
  readonly squidSdk: SquidSdk
  readonly open: boolean
  readonly mode: WalletMode
  readonly onOpenChange: (open: boolean) => void
  readonly onAccountSelect: (account: Account) => void
}

type UncontrolledProps = {
  readonly squidSdk: SquidSdk
}

type Props = ControlledProps | UncontrolledProps

const Web3ConnectModalContent: FC<Props> = (props) => {
  const { squidSdk } = props

  const isControlled =
    "open" in props &&
    "onOpenChange" in props &&
    "onAccountSelect" in props &&
    "mode" in props

  const store = useWeb3Connect(useShallow(pick(["setAccount", "mode"])))

  const mode = isControlled ? props.mode : store.mode
  const onAccountSelect = isControlled
    ? props.onAccountSelect
    : store.setAccount

  const { page, setPage } = useWeb3ConnectInit({
    mode,
  })

  const context = useMemo<Web3ConnectContextType>(
    () => ({
      isControlled,
      page,
      setPage,
      squidSdk,
      onAccountSelect,
      mode,
    }),
    [page, setPage, squidSdk, onAccountSelect, isControlled, mode],
  )
  return (
    <Web3ConnectProvider value={context}>
      {contentMap[page]}
      {page !== Web3ConnectModalPage.ProviderSelect && <AccountActionsFooter />}
    </Web3ConnectProvider>
  )
}

export const Web3ConnectModal: FC<Props> = (props) => {
  const isControlled =
    "open" in props && "onOpenChange" in props && "onAccountSelect" in props

  useWeb3EagerEnable(!isControlled)
  useWalletSubscriptions()

  const modalState = useWeb3ConnectModal()

  const open = isControlled ? props.open : modalState.open
  const onOpenChange = isControlled
    ? props.onOpenChange
    : () => modalState.toggle()

  return (
    <Modal open={open} onOpenChange={onOpenChange} disableInteractOutside>
      <Web3ConnectModalContent {...props} />
    </Modal>
  )
}
