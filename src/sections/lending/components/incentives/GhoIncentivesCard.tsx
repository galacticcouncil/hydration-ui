import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { NoData } from "sections/lending/components/primitives/NoData"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { HollarBorrowApyRange } from "sections/lending/ui/hollar/hollar-banner/HollarBorrowApyRange"

export interface GhoIncentivesCardProps {
  value: string | number
  useApyRange?: boolean
  rangeValues?: [number, number]
  stkAaveBalance: string | number
  ghoRoute: string
  userQualifiesForDiscount: boolean
  onMoreDetailsClick?: () => void
  withTokenIcon?: boolean
  forceShowTooltip?: boolean
}

export const GhoIncentivesCard = ({
  value,
  useApyRange,
  rangeValues = [0, 0],
  ghoRoute,
  stkAaveBalance,
  userQualifiesForDiscount,
  onMoreDetailsClick,
  withTokenIcon = false,
  forceShowTooltip = false,
}: GhoIncentivesCardProps) => {
  const { ghoReserveData } = useAppDataContext()
  const stkAaveAmount = Number(stkAaveBalance)

  const minStkAaveBalanceReached =
    stkAaveAmount >= ghoReserveData.ghoMinDiscountTokenBalanceForDiscount

  let toolTipContent = <></>
  const showTooltip = userQualifiesForDiscount || forceShowTooltip
  if (showTooltip) {
    toolTipContent = (
      <div
        sx={{
          py: 4,
          px: 6,
          fontSize: "12px",
          lineHeight: "16px",
        }}
      >
        <Text fs={12} lh={16} sx={{ py: 12, px: 18 }}>
          <span>
            Estimated compounding interest, including discount for Staking{" "}
            {minStkAaveBalanceReached ? (
              <>
                <FormattedNumber value={stkAaveAmount} visibleDecimals={2} />{" "}
              </>
            ) : null}
            in Safety Module.
          </span>{" "}
          <Link onClick={onMoreDetailsClick} href={ghoRoute}>
            <span>Learn more</span>
          </Link>
        </Text>
      </div>
    )
  }

  return (
    <div
      sx={{
        flex: "column",
        align: ["flex-end", "center"],
        justify: "center",
        textAlign: "center",
      }}
    >
      {value.toString() !== "-1" ? (
        <InfoTooltip text={toolTipContent}>
          <div sx={{ flex: "row", align: "center" }}>
            {withTokenIcon && (
              <TokenIcon
                symbol="stkAAVE"
                sx={{ height: 14, width: 14, mr: 1 }}
              />
            )}
            {useApyRange ? (
              <HollarBorrowApyRange
                minVal={Math.min(...rangeValues)}
                maxVal={Math.max(...rangeValues)}
              />
            ) : (
              <FormattedNumber value={value} percent />
            )}
          </div>
        </InfoTooltip>
      ) : (
        <NoData />
      )}
    </div>
  )
}
