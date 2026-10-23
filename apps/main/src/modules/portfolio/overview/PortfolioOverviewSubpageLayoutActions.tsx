import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import {
  useAccount,
  useWeb3ConnectModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"

type Modal = "send"

export const PortfolioOverviewSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const [modal, setModal] = useState<Modal | null>(null)
  const setOnrampModal = useOnrampModal((state) => state.setModal)
  const openWithdraw = useOnrampModal((state) => state.openWithdraw)

  return (
    <Flex gap="m">
      <Button
        variant="accent"
        size="small"
        outline
        onClick={() => {
          if (!account?.canUseOnHydration) {
            toggle(WalletMode.SubstrateEVM)
          } else {
            setModal("send")
          }
        }}
      >
        {t("send")}
      </Button>
      <Button variant="emphasis" outline onClick={openWithdraw}>
        <Minus />
        {t("withdraw")}
      </Button>
      <Button
        variant="emphasis"
        outline
        onClick={() => setOnrampModal("deposit")}
      >
        <Plus />
        {t("deposit")}
      </Button>

      <Modal
        variant="popup"
        open={modal !== null && !!account?.canUseOnHydration}
        onOpenChange={() => setModal(null)}
      >
        {modal === "send" && account?.canUseOnHydration && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
