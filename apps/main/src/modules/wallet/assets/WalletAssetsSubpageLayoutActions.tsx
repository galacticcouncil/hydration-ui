import { Send } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"

type Modal = "send" | "withdraw" | "deposit"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
  const [modal, setModal] = useState<Modal | null>(null)

  return (
    <Flex gap="m">
      <Button
        css={{ paddingBlock: 14, paddingInline: 18 }}
        variant="accent"
        size="small"
        outline
        onClick={() => setModal("send")}
      >
        {isMobile ? <Icon component={Send} size="m" /> : t("send")}
      </Button>
      {/* <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Minus} />
        {t("withdraw")}
      </Button>
      <Button variant="emphasis" outline disabled>
        <Icon width={16} height={9} component={Plus} />
        {t("deposit")}
      </Button> */}
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
