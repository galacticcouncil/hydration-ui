import { Add, Minus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Actions = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()

  const [action, setAction] = useState<Actions | null>(null)

  if (isMobile) {
    return null
  }

  return (
    <Flex gap={12}>
      <Button variant="accent" outline onClick={() => setAction("send")}>
        {t("send")}
      </Button>
      <Button
        variant="emphasis"
        outline
        iconStart={Minus}
        onClick={() => setAction("withdraw")}
      >
        {t("withdraw")}
      </Button>
      <Button
        variant="emphasis"
        outline
        iconStart={Add}
        onClick={() => setAction("deposit")}
      >
        {t("deposit")}
      </Button>
      <Modal open={action === "send"} onOpenChange={() => setAction(null)}>
        <TransferPositionModal onClose={() => setAction(null)} />
      </Modal>
    </Flex>
  )
}
