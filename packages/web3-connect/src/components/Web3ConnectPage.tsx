import { hydration } from "@galacticcouncil/descriptors"
import { NeckworkClient } from "@galacticcouncil/indexer/neckwork"
import { TypedApi } from "polkadot-api"
import { FC, ReactNode } from "react"
import { I18nextProvider } from "react-i18next"

import { Web3ConnectModalContent } from "@/components/Web3ConnectModal"
import {
  Account,
  WalletMode,
  Web3ConnectModalMeta,
} from "@/hooks/useWeb3Connect"
import i18n from "@/i18n"

type Web3ConnectPageProps = {
  neckwork: NeckworkClient
  papi: TypedApi<typeof hydration>
  mode: WalletMode
  meta?: Web3ConnectModalMeta
  accountFilter?: (account: Account) => boolean
  customSource?: { title: string; content: ReactNode }
  onAccountSelect: (account: Account) => void
  onBack: () => void
}

const ignoreModalChange = () => undefined

/** The controlled wallet picker embedded in a multi-step page. */
export const Web3ConnectPage: FC<Web3ConnectPageProps> = (props) => (
  <I18nextProvider i18n={i18n}>
    <Web3ConnectModalContent
      {...props}
      open
      isPage
      onOpenChange={ignoreModalChange}
      setModalContentWidth={ignoreModalChange}
    />
  </I18nextProvider>
)
