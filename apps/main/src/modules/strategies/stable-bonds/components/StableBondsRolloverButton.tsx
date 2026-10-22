import { Button, ButtonProps, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { StableBondsRolloverModalContent } from "@/modules/strategies/stable-bonds/components/StableBondsRolloverModalContent"
import { useStableBondsRollover } from "@/modules/strategies/stable-bonds/hooks/useStableBondsRollover"

type StableBondsRolloverButtonProps = Omit<ButtonProps, "onClick"> & {
  bondId: string
}

export const StableBondsRolloverButton: FC<StableBondsRolloverButtonProps> = ({
  bondId,
  children,
  ...props
}) => {
  const { t } = useTranslation("strategies")
  const [isOpen, setIsOpen] = useState(false)
  const rollover = useStableBondsRollover(bondId)

  if (!rollover) return null

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)} {...props}>
        {children ?? t("bonds.rollover.cta")}
      </Button>
      <Modal variant="popup" open={isOpen} onOpenChange={setIsOpen}>
        <StableBondsRolloverModalContent
          rollover={rollover}
          onClose={() => setIsOpen(false)}
        />
      </Modal>
    </>
  )
}
