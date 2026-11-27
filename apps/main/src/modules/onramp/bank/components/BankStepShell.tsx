import { Modal, ModalHeader, Stepper } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import {
  BANK_STEPS,
  BankStepKey,
  useBankFlow,
} from "@/modules/onramp/bank/hooks/useBankFlow"

type BankStepShellProps = {
  title: string
  description?: string
  /** The wizard step; null for a view reopened from Portfolio (no stepper there). */
  step: BankStepKey | null
  steps?: ReadonlyArray<BankStepKey>
  /** Back within the flow; without it, back leaves the flow (the method choice). */
  onBack?: () => void
  children: ReactNode
}

/**
 * One screen of a bank flow in the Figma modal: stepper, then the header with
 * title, back and close. The body and footer are the screen's own.
 */
export const BankStepShell: FC<BankStepShellProps> = ({
  title,
  description,
  step,
  steps: customSteps,
  onBack,
  children,
}) => {
  const { t } = useTranslation(["onramp"])
  const { direction, onExit, onClose, reopened } = useBankFlow()
  const steps = customSteps ?? BANK_STEPS[direction]
  // Figma P01/R01: a process reopened from Portfolio shows no wizard stepper.
  const active = step && !reopened ? steps.indexOf(step) : -1

  return (
    <Modal
      open
      variant="popup"
      disableInteractOutside
      contentWidth="572px"
      onOpenChange={(open) => {
        if (!open) (onClose ?? onExit)?.()
      }}
      topContent={
        active >= 0 && (
          <Stepper
            steps={steps.map((key) => t(`bank.step.${key}`))}
            activeStepIndex={active}
          />
        )
      }
    >
      <ModalHeader
        title={title}
        description={description}
        align="center"
        onBack={onBack ?? onExit}
        closable={!!onClose}
        onClose={onClose}
      />
      {children}
    </Modal>
  )
}
