import {
  CircleAlertIcon,
  CircleCheckIcon,
  Clock3Icon,
  HourglassIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from "@galacticcouncil/ui/assets/icons"
import { Chip, ChipVariant, Icon } from "@galacticcouncil/ui/components"
import { ComponentType, FC } from "react"
import { useTranslation } from "react-i18next"

import { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"

type PortfolioDepositStatusProps = {
  status: PortfolioDepositSample["status"]
  label?: string
  compact?: boolean
}

const statusAppearance: Record<
  PortfolioDepositSample["status"],
  { variant: ChipVariant; icon: ComponentType }
> = {
  awaiting: { variant: "amber", icon: Clock3Icon },
  processing: { variant: "blue", icon: LoaderCircleIcon },
  confirming: { variant: "cyan", icon: HourglassIcon },
  claimable: { variant: "blue", icon: CircleCheckIcon },
  completed: { variant: "green", icon: CircleCheckIcon },
  attention: { variant: "orange", icon: CircleAlertIcon },
  failed: { variant: "red", icon: XCircleIcon },
}

export const PortfolioDepositStatus: FC<PortfolioDepositStatusProps> = ({
  status,
  compact = false,
  label,
}) => {
  const { t } = useTranslation("onramp")
  const { variant, icon } = statusAppearance[status]
  return (
    <Chip variant={variant} size="small" rounded>
      <Icon component={icon} size={12} aria-hidden />
      {label ??
        (compact && (status === "awaiting" || status === "attention")
          ? t(`deposit.portfolio.status.compact.${status}`)
          : t(`deposit.portfolio.status.${status}`))}
    </Chip>
  )
}
