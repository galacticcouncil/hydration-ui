import { ModalHeader, Stepper } from "@galacticcouncil/ui/components"
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
  onBack,
  children,
}) => {
  const { t } = useTranslation(["onramp"])
  const { direction, onExit, onClose, reopened } = useBankFlow()
  const steps: ReadonlyArray<BankStepKey> = BANK_STEPS[direction]
  // Figma P01/R01: a process reopened from Portfolio shows no wizard stepper.
  const active = step && !reopened ? steps.indexOf(step) : -1

  return (
    <>
      {active >= 0 && (
        <Stepper
          steps={steps.map((key) => t(`bank.step.${key}`))}
          activeStepIndex={active}
          // The kit's default ("auto"): compact on mobile, the expanded
          // stepper with its labels under the circles on desktop. Forcing
          // compact on desktop drops the labels outside the card (kit bug).
          px="xl"
          pt="l"
        />
      )}
      <ModalHeader
        title={title}
        description={description}
        align="center"
        onBack={onBack ?? onExit}
        closable={!!onClose}
        onClose={onClose}
      />
      {children}
    </>
  )
}
