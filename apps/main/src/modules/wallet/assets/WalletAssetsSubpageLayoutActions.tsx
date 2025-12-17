import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"

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
      <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Minus} />
        {t("withdraw")}
      </Button>
      <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Plus} />
        {t("deposit")}
      </Button>
      <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
