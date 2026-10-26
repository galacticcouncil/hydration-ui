import {
  ArrowDownLeft,
  ArrowRight,
  Check,
  CircleAlert,
  Clock3,
  Globe2,
  Hourglass,
  RotateCcw,
  X,
} from "@galacticcouncil/ui/assets/icons"
import {
  Chip,
  ChipProps,
  ChipVariant,
  Icon,
} from "@galacticcouncil/ui/components"
import { ComponentType, FC } from "react"
import { capitalize } from "remeda"

import { DepositStatus, RailStatus } from "./deposit.mock"

type BankDepositStatusChipProps = {
  status: DepositStatus | RailStatus
  size?: ChipProps["size"]
}

const statusAppearance: Record<
  DepositStatus | RailStatus,
  {
    variant: ChipVariant
    icon: ComponentType
  }
> = {
  available: { variant: "green", icon: Check },
  "in review": { variant: "amber", icon: Clock3 },
  "more info needed": { variant: "orange", icon: CircleAlert },
  rejected: { variant: "red", icon: X },
  "not offered in region": { variant: "red", icon: Globe2 },
  "Received by Bridge": { variant: "blue", icon: ArrowDownLeft },
  "Sent to Base": { variant: "blue", icon: ArrowRight },
  Arrived: { variant: "cyan", icon: ArrowDownLeft },
  "Waiting for deposit limit": { variant: "amber", icon: Hourglass },
  Depositing: { variant: "blue", icon: ArrowRight },
  "Queued on Hydration": { variant: "amber", icon: Clock3 },
  Credited: { variant: "green", icon: Check },
  Returned: { variant: "red", icon: RotateCcw },
}

export const BankDepositStatusChip: FC<BankDepositStatusChipProps> = ({
  status,
  size = "small",
}) => {
  const { variant, icon } = statusAppearance[status]
  return (
    <Chip variant={variant} size={size} rounded>
      <Icon component={icon} size={size === "large" ? "m" : "s"} aria-hidden />
      {capitalize(status)}
    </Chip>
  )
}
