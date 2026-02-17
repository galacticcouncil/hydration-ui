import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { ProviderSelect } from "@/components/provider/ProviderSelect"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount, useWeb3ConnectModal } from "@/hooks"

export const ProviderSelectContent = () => {
  const { t } = useTranslation()
  const { meta } = useWeb3ConnectModal()
  const { isConnected } = useAccount()
  const { setPage } = useWeb3ConnectContext()
  return (
    <>
      <ModalHeader
        title={meta?.title ?? t("provider.connectWallet")}
        description={meta?.description}
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
