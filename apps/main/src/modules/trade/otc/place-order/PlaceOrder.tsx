import { Add } from "@galacticcouncil/ui/assets/icons"
import { Button, Modal } from "@galacticcouncil/ui/components"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { PlaceOrderModalContent } from "@/modules/trade/otc/place-order/PlaceOrderModalContent"

export const PlaceOrder: FC = () => {
  const { t } = useTranslation()
  const isSigned = useWeb3Connect((s) => !!s.account)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="primary"
        size="medium"
        iconStart={Add}
        disabled={!isSigned}
        onClick={() => setIsOpen(true)}
      >
        {t("trade.otc.placeOrder.cta")}
      </Button>
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <PlaceOrderModalContent />
      </Modal>
    </>
  )
}
