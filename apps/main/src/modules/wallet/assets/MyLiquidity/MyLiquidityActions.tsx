import { Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool"

export const MyLiquidityActions: FC = () => {
  const { t } = useTranslation("wallet")
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button size="medium" onClick={() => setIsOpen(true)}>
        <Plus />
        {t("myLiquidity.header.cta")}
      </Button>
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <CreateIsolatedPool closable onSubmitted={() => setIsOpen(false)} />
      </Modal>
    </>
  )
}
