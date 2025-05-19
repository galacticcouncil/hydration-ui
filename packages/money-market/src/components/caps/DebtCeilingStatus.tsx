import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { ProgressBar, Text, Tooltip } from "@galacticcouncil/ui/components"

import { AssetCapHookData } from "@/hooks"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"

type DebtCeilingTooltipProps = {
  debt: string
  ceiling: string
  usageData: AssetCapHookData
  className?: string
}

export const DebtCeilingStatus = ({
  debt,
  ceiling,
  usageData,
  className,
}: DebtCeilingTooltipProps) => {
  const { formatCurrency } = useAppFormatters()
  const determineColor = () => {
    if (usageData.isMaxed || usageData.percentUsed >= 99.99) {
      return "red400"
    } else if (usageData.percentUsed >= 98) {
      return "warning300"
    } else {
      return "green400"
    }
  }

  return (
    <div className={className}>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <Text fs={13} color="basic400">
            <span>Isolated Debt Ceiling</span>
          </Text>
          <Tooltip
            text={
              <span sx={{ color: "white" }}>
                <span>
                  Debt ceiling limits the amount possible to borrow against this
                  asset by protocol users. Debt ceiling is specific to assets in
                  isolation mode and is denoted in USD.
                </span>
              </span>
            }
          >
            <CircleInfo />
          </Tooltip>
        </div>
        <Text fs={14}>
          {formatCurrency(Number(debt))}
          <span sx={{ display: "inline-block", mx: 4 }}>of</span>
          {formatCurrency(Number(ceiling))}
        </Text>
      </div>
      <ProgressBar
        size="small"
        color={determineColor()}
        value={usageData.percentUsed <= 1 ? 1 : usageData.percentUsed}
      />
    </div>
  )
}
