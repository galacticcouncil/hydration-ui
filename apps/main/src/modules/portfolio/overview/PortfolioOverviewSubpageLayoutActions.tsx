import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"

type Modal = "send" | "withdraw" | "deposit"

export const PortfolioOverviewSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const [modal, setModal] = useState<Modal | null>(null)

  return (
    <Flex gap="m">
      <Button
        variant="accent"
        size="small"
        outline
        onClick={() => setModal("send")}
      >
        {t("send")}
      </Button>
      <Button
        variant="emphasis"
        outline
        onClick={() => setModal("withdraw")}
        asChild
      >
        <Link to={LINKS.withdraw}>
          <Minus />
          {t("withdraw")}
        </Link>
      </Button>
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

      <Modal
        variant="popup"
        open={modal !== null}
        onOpenChange={() => setModal(null)}
      >
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
