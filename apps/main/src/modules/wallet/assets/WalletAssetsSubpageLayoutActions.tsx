import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Modal = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()

  const [modal, setModal] = useState<Modal | null>(null)

  if (!account || isMobile) {
    return null
  }

  return (
    <Flex gap={12}>
      <Button variant="accent" outline onClick={() => setModal("send")}>
        {t("send")}
      </Button>
      {/* TODO withdraw and deposit */}
      {/* <Button variant="emphasis" outline onClick={() => setModal("withdraw")}>
        <Minus />
        {t("withdraw")}
      </Button> */}
      <Button
        variant="emphasis"
        outline
        onClick={() => setModal("deposit")}
        asChild
      >
        <Link to={LINKS.deposit}>
          <Plus />
          {t("deposit")}
        </Link>
      </Button>
      <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
