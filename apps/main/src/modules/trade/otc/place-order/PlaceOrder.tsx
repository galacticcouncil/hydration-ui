import { Add } from "@galacticcouncil/ui/assets/icons"
import { Button, Modal } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { PlaceOrderModalContent } from "@/modules/trade/otc/place-order/PlaceOrderModalContent"

export const PlaceOrder: FC = () => {
  const { t } = useTranslation("trade")
  const { isConnected } = useAccount()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="primary"
        size="medium"
        iconStart={Add}
        disabled={!isConnected}
        onClick={() => setIsOpen(true)}
      >
        {t("otc.placeOrder.cta")}
      </Button>
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <PlaceOrderModalContent onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  )
}
