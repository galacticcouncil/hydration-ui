import {
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
} from "@galacticcouncil/ui/assets/icons"
import { Chip, Icon } from "@galacticcouncil/ui/components"
import { FC } from "react"

const TONE_APPEARANCE = {
  pending: { variant: "blue", icon: ClockIcon },
  attention: { variant: "amber", icon: CircleAlertIcon },
  neutral: { variant: "secondary", icon: null },
  success: { variant: "green", icon: CheckIcon },
  unknown: { variant: "secondary", icon: null },
} as const

type BankStatusPillProps = {
  /** The text exactly as given: a server label, or our copy for a code. */
  label: string
  tone: keyof typeof TONE_APPEARANCE
}

/** A status pill (Figma history and tiles): the colour follows the tone only. */
export const BankStatusPill: FC<BankStatusPillProps> = ({ label, tone }) => {
  const { variant, icon } = TONE_APPEARANCE[tone]
  return (
    // The kit's Chip is one line that never shrinks; a server label can be long
    // ("Cancelled - HOLLAR waiting for mint capacity"), so it may wrap, in full.
    <Chip
      variant={variant}
      size="small"
      rounded
      data-tone={tone}
      data-pill-label={label}
      data-white-space="normal"
      sx={{
        whiteSpace: "normal",
        height: "auto",
        maxWidth: "100%",
        flexShrink: 1,
        lineHeight: 1.3,
        textAlign: "left",
      }}
    >
      {icon && <Icon component={icon} size="s" aria-hidden />}
      {label}
    </Chip>
  )
}
