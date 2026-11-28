import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useOnrampModalStore } from "@/modules/onramp/store/useOnrampModalStore"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"

export const PortfolioOverviewSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const [isSendOpen, setIsSendOpen] = useState(false)
  const openOnramp = useOnrampModalStore((state) => state.open)

  return (
    <Flex gap="m">
      <Button
        variant="accent"
        size="small"
        outline
        onClick={() => setIsSendOpen(true)}
      >
        {t("send")}
      </Button>
      <Button variant="emphasis" outline onClick={() => openOnramp("withdraw")}>
        <Minus />
        {t("withdraw")}
      </Button>
      <Button variant="emphasis" outline onClick={() => openOnramp("deposit")}>
        <Plus />
        {t("deposit")}
      </Button>

      <Modal variant="popup" open={isSendOpen} onOpenChange={setIsSendOpen}>
        <TransferPositionModal onClose={() => setIsSendOpen(false)} />
      </Modal>
    </Flex>
  )
}
