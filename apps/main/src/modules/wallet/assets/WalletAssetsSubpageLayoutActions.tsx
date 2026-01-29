import { Minus, Send } from "@galacticcouncil/ui/assets/icons"
import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Modal = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
  const [modal, setModal] = useState<Modal | null>(null)

  return (
    <Flex gap={12}>
      <Button
        css={{ paddingBlock: 14, paddingInline: 18 }}
        variant="accent"
        size="small"
        outline
        onClick={() => setModal("send")}
      >
        {isMobile ? <Icon component={Send} size={16} /> : t("send")}
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
      <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
