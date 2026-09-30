import { css, Global } from "@emotion/react"
import { hydration } from "@galacticcouncil/descriptors"
import { NeckworkClient } from "@galacticcouncil/indexer/neckwork"
import { Modal } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { TypedApi } from "polkadot-api"
import { FC, useEffect, useMemo, useState } from "react"
import { I18nextProvider } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { ExternalWalletContent } from "@/components/content/ExternalWalletContent"
import { MultisigConfigSelectContent } from "@/components/content/MultisigConfigSelectContent"
import { MultisigSetupContent } from "@/components/content/MultisigSetupContent"
import { MultisigSignerSelectContent } from "@/components/content/MultisigSignerSelectContent"
import { WalletManagementContent } from "@/components/content/WalletManagementContent"
import { Web3ConnectModalPage } from "@/config/modal"
import {
  Web3ConnectContextType,
  Web3ConnectProvider,
} from "@/context/Web3ConnectContext"
import {
  Account,
  useWeb3Connect,
  WalletMode,
  Web3ConnectModalMeta,
} from "@/hooks/useWeb3Connect"
import { useWeb3ConnectInit } from "@/hooks/useWeb3ConnectInit"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import i18n from "@/i18n"

const NEAR_CONNECT_POPUP_STYLES = css`
  .hot-connector-popup {
    pointer-events: auto;
  }
`

const contentMap: Record<Web3ConnectModalPage, React.ReactNode> = {
  [Web3ConnectModalPage.Wallets]: <WalletManagementContent />,
  [Web3ConnectModalPage.ExternalWallet]: <ExternalWalletContent />,
  [Web3ConnectModalPage.MultisigSetup]: <MultisigSetupContent />,
  [Web3ConnectModalPage.MultisigConfigSelect]: <MultisigConfigSelectContent />,
  [Web3ConnectModalPage.MultisigSignerSelect]: <MultisigSignerSelectContent />,
}

type ControlledProps = {
  readonly neckwork: NeckworkClient
  readonly papi: TypedApi<typeof hydration>
  readonly open: boolean
  readonly mode: WalletMode
  readonly meta?: Web3ConnectModalMeta
  readonly onOpenChange: (open: boolean) => void
  readonly onAccountSelect: (account: Account) => void
}

type UncontrolledProps = {
  readonly neckwork: NeckworkClient
  readonly papi: TypedApi<typeof hydration>
}

type Props = ControlledProps | UncontrolledProps

type Web3ConnectModalContentProps = Props & {
  readonly setModalContentWidth: (width: string) => void
}

const Web3ConnectModalContent: FC<Web3ConnectModalContentProps> = (props) => {
  const { neckwork, papi, setModalContentWidth } = props

  const isControlled =
    "open" in props &&
    "onOpenChange" in props &&
    "onAccountSelect" in props &&
    "mode" in props

  const store = useWeb3Connect(useShallow(pick(["setAccount", "mode", "meta"])))

  const mode = isControlled ? props.mode : store.mode
  const meta = isControlled ? props.meta : store.meta
  const onAccountSelect = isControlled
    ? props.onAccountSelect
    : store.setAccount

  const { page, setPage } = useWeb3ConnectInit({
    initialPage: meta?.initialPage,
  })

  /**
   * Every page but Wallets is a fixed width. Wallets sizes itself from
   * `showAccountPanel` inside `WalletManagementContent`, so this must not fire
   * for it - two writers on one value is what made the error screen jump.
   */
  useEffect(() => {
    if (page === Web3ConnectModalPage.Wallets) return
    setModalContentWidth(pxToRem(650))
  }, [page, setModalContentWidth])

  const context = useMemo<Web3ConnectContextType>(
    () => ({
      isControlled,
      page,
      setPage,
      neckwork,
      papi,
      onAccountSelect,
      mode,
      meta,
      setModalContentWidth,
    }),
    [
      page,
      setPage,
      neckwork,
      onAccountSelect,
      isControlled,
      mode,
      meta,
      papi,
      setModalContentWidth,
    ],
  )
  return (
    <Web3ConnectProvider value={context}>
      {contentMap[page]}
    </Web3ConnectProvider>
  )
}

export const Web3ConnectModal: FC<Props> = (props) => {
  const isControlled =
    "open" in props && "onOpenChange" in props && "onAccountSelect" in props

  const modalState = useWeb3ConnectModal()
  const [modalContentWidth, setModalContentWidth] = useState(pxToRem(650))

  const open = isControlled ? props.open : modalState.open
  const onOpenChange = isControlled
    ? props.onOpenChange
    : () => modalState.toggle()

  return (
    <I18nextProvider i18n={i18n}>
      {/* near-connect mounts NEAR wallet popups on document.body, where the
          modal turns pointer events off */}
      <Global styles={NEAR_CONNECT_POPUP_STYLES} />
      <Modal
        variant="popup"
        open={open}
        onOpenChange={onOpenChange}
        disableInteractOutside
        contentWidth={modalContentWidth}
      >
        <Web3ConnectModalContent
          {...props}
          setModalContentWidth={setModalContentWidth}
        />
      </Modal>
    </I18nextProvider>
  )
}
