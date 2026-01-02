import { Send } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"

import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Modal = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()

  const [modal, setModal] = useState<Modal | null>(null)

  if (!account || isMobile) {
    return null
  }

  return (
    <Flex gap={12}>
      <Button
        css={{ padding: 14 }}
        variant="accent"
        outline
        onClick={() => setModal("send")}
      >
        <Icon component={Send} size={16} />
      </Button>
      {/* <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Minus} />
        {t("withdraw")}
      </Button>
      <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Plus} />
        {t("deposit")}
      </Button> */}
      <Modal open={modal !== null} onOpenChange={() => setModal(null)}>
        {modal === "send" && (
          <TransferPositionModal onClose={() => setModal(null)} />
        )}
      </Modal>
    </Flex>
  )
}
