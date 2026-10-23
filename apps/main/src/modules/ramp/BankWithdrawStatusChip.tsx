import {
  ArrowRight,
  Check,
  Clock3,
  RotateCcw,
} from "@galacticcouncil/ui/assets/icons"
import { Chip, ChipVariant, Icon } from "@galacticcouncil/ui/components"
import { ComponentType, FC } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawalStatus } from "./BankWithdraw.utils"

type BankWithdrawStatusChipProps = { status: WithdrawalStatus }
const statusAppearance: Record<
  WithdrawalStatus,
  { variant: ChipVariant; icon: ComponentType }
> = {
  pending: { variant: "amber", icon: Clock3 },
  processing: { variant: "blue", icon: ArrowRight },
  completed: { variant: "green", icon: Check },
  returned: { variant: "red", icon: RotateCcw },
}

export const BankWithdrawStatusChip: FC<BankWithdrawStatusChipProps> = ({
  status,
}) => {
  const { t } = useTranslation("onramp")
  const { variant, icon } = statusAppearance[status]
  return (
    <Chip variant={variant} size="large" rounded>
      <Icon component={icon} size={14} aria-hidden />
      {t(`bankWithdraw.status.${status}`)}
    </Chip>
  )
}
