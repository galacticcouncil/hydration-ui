import { FormattedGhoReserveData } from "@aave/math-utils"
import { DataValue, DataValueList } from "components/DataValue"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { PercentageValue } from "components/PercentageValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { CapsCircularStatus } from "sections/lending/components/caps/CapsCircularStatus"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

interface GhoBorrowInfoProps {
  reserve: ComputedReserveData
  ghoReserveData: FormattedGhoReserveData
  totalBorrowed: number
  totalBorrowedUSD: string
  maxAvailableToBorrow: number
  maxAvailableToBorrowUSD: number
  borrowCapUsage: number
}

export const GhoBorrowInfo = ({
  reserve,
  ghoReserveData,
  totalBorrowed,
  totalBorrowedUSD,
  maxAvailableToBorrow,
  maxAvailableToBorrowUSD,
  borrowCapUsage,
}: GhoBorrowInfoProps) => {
  const { t } = useTranslation()

  const hasBorrowCap = reserve.borrowCapUSD && reserve.borrowCapUSD !== "0"

  const CapProgress = () => (
    <CapsCircularStatus
      value={borrowCapUsage}
      color="pink500"
      tooltipContent={t("lending.borrow.cap.tooltip", {
        value: maxAvailableToBorrow,
        symbol: reserve.symbol,
        usdValue: maxAvailableToBorrowUSD,
      })}
    />
  )

  return (
    <>
      <div
        sx={{
          flex: ["column", "row"],
          align: ["start", "center"],
          gap: [20, 40],
          mb: 20,
        }}
      >
        <div sx={{ display: ["none", "block"] }}>
          <CapProgress />
        </div>
        <div sx={{ width: ["100%", hasBorrowCap ? "60%" : "40%"], mb: 10 }}>
          <DataValueList separated>
            <DataValue
              label={
                <div sx={{ flex: "column", gap: 10 }}>
                  <Text
                    color="basic400"
                    fs={14}
                    sx={{ flex: "row", gap: 4, align: "center" }}
                  >
                    {t("lending.market.table.totalBorrowed")}{" "}
                    <InfoTooltip
                      text={
                        <Text fs={12}>{t("lending.tooltip.borrowCap")}</Text>
                      }
                    >
                      <SInfoIcon />
                    </InfoTooltip>
                  </Text>
                  <div sx={{ display: ["block", "none"] }}>
                    <CapProgress />
                  </div>
                </div>
              }
              labelColor="basic400"
              font="GeistSemiBold"
            >
              {t("lending.cap.range", {
                valueA: reserve.totalDebt,
                valueB: reserve.borrowCap,
              })}
              <Text
                fs={12}
                font="Geist"
                color="basic500"
                tAlign={["right", "left"]}
              >
                {t("lending.cap.range.usd", {
                  valueA: reserve.totalDebtUSD,
                  valueB: reserve.borrowCapUSD,
                })}
              </Text>
            </DataValue>
            <DataValue
              label={t("lending.apyBorrowRate")}
              labelColor="basic400"
              font="GeistSemiBold"
            >
              <PercentageValue
                value={Number(ghoReserveData.ghoVariableBorrowAPY) * 100}
              />
            </DataValue>
          </DataValueList>
        </div>
      </div>
    </>
  )
}
