import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { MultisigSetup } from "@/components/multisig/MultisigSetup"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"

export const MultisigSetupContent = () => {
  const { t } = useTranslation()
  const { setPage } = useWeb3ConnectContext()

  return (
    <>
      <ModalHeader
        title={t("multisig.setup.title")}
        align="center"
        onBack={() => setPage(Web3ConnectModalPage.ProviderSelect)}
      />
      <ModalBody scrollable>
        <MultisigSetup
          onContinue={() => setPage(Web3ConnectModalPage.MultisigSignerSelect)}
        />
      </ModalBody>
    </>
  )
}
