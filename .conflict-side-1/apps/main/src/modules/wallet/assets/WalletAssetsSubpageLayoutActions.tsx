import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { WithdrawModalContainer } from "@/modules/wallet/assets/Withdraw/WithdrawModalContainer"

type Modal = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()

  const [modal, setModal] = useState<Modal | null>(null)

  if (isMobile) {
    return null
  }

  return (
    <Flex gap={12}>
      <Button variant="accent" outline onClick={() => setModal("send")}>
        {t("send")}
      </Button>
      <Button
        variant="emphasis"
        outline
        iconStart={Minus}
        onClick={() => setModal("withdraw")}
      >
        {t("withdraw")}
      </Button>
      <Button
        variant="emphasis"
        outline
        iconStart={Plus}
        onClick={() => setModal("deposit")}
      >
        {t("deposit")}
      </Button>
      <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
        {modal === "withdraw" && <WithdrawModalContainer />}
      </Modal>
    </Flex>
  )
}
