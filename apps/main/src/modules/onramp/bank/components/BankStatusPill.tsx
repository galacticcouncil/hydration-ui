import { Chip } from "@galacticcouncil/ui/components"
import { FC } from "react"

const TONE_VARIANT = {
  pending: "blue",
  attention: "amber",
  neutral: "secondary",
  success: "green",
  unknown: "secondary",
} as const

type BankStatusPillProps = {
  /** The text exactly as given: a server label, or our copy for a code. */
  label: string
  tone: keyof typeof TONE_VARIANT
}

/** A status pill (Figma history and tiles): the colour follows the tone only. */
export const BankStatusPill: FC<BankStatusPillProps> = ({ label, tone }) => (
  <Chip variant={TONE_VARIANT[tone]} size="small" rounded data-tone={tone}>
    {label}
  </Chip>
)
