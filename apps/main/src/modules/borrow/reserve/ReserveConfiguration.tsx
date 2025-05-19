import {
  ComputedReserveData,
  useAssetCaps,
  useProtocolDataContext,
} from "@galacticcouncil/money-market/hooks"
import { Stack, Text, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { InterestRateModelChart } from "@/modules/borrow/reserve/components/InterestRateModelChart"
import { SupplyInfo } from "@/modules/borrow/reserve/components/SupplyInfo"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveSectionDivider = () => (
  <div
    sx={{
      bg: getToken("surfaces.themeBasePalette.background"),
      height: 4,
      mx: -20,
      my: [20, 40],
    }}
  />
)

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const { currentMarketData } = useProtocolDataContext()
  const { supplyCap, debtCeiling, borrowCap } = useAssetCaps()

  const showSupplyCapStatus = reserve.supplyCap !== "0"
  const showBorrowCapStatus = reserve.borrowCap !== "0"

  const shouldRenderBorrowInfo =
    reserve.borrowingEnabled || Number(reserve.totalDebt) > 0

  const shouldRenderEModeInfo = reserve.eModeCategoryId !== 0

  return (
    <>
      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Supply info
      </Text>
      {supplyCap && (
        <SupplyInfo
          reserve={reserve}
          currentMarketData={currentMarketData}
          showSupplyCapStatus={showSupplyCapStatus}
          supplyCap={supplyCap}
          debtCeiling={debtCeiling}
        />
      )}

      {/* <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Borrow info
      </Text> */}

      <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Interest rate model
      </Text>

      <InterestRateModelChart />

      <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        E-Mode info
      </Text>

      <ValueStats
        size="small"
        font="secondary"
        alwaysWrap
        label={"E-Mode Category"}
        value={"Stablecoins"}
      />

      <Stack direction="row" gap={40} sx={{ mt: 20 }}>
        <ValueStats
          size="small"
          alwaysWrap
          font="secondary"
          label={t("borrow:maxLTV")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLtv) * 100,
          })}
        />
        <ValueStats
          size="small"
          alwaysWrap
          font="secondary"
          label={t("borrow:risk.liquidationThreshold")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLiquidationThreshold) * 100,
          })}
        />
        <ValueStats
          size="small"
          alwaysWrap
          font="secondary"
          label={t("borrow:risk.liquidationPenalty")}
          value={t("percent", {
            value: Number(reserve.formattedEModeLiquidationBonus) * 100,
          })}
        />
      </Stack>

      {/*  {shouldRenderBorrowInfo && (
        <>
          <ReserveSectionDivider />
          <Text color="pink500" fs={14} sx={{ mb: 30 }}>
            Borrow info
          </Text>
          <BorrowInfo
            reserve={reserve}
            currentMarketData={currentMarketData}
            currentNetworkConfig={currentNetworkConfig}
            renderCharts={renderCharts}
            showBorrowCapStatus={showBorrowCapStatus}
            borrowCap={borrowCap}
          />
          <ReserveSectionDivider />
          <Text color="brightBlue700" fs={14} sx={{ mb: 30 }}>
            Interest rate model
          </Text>
          <InterestRateModelInfo
            reserve={reserve}
            currentNetworkConfig={currentNetworkConfig}
          />
        </>
      )}

      {shouldRenderEModeInfo && (
        <>
          <ReserveSectionDivider />
          <Text fs={14} sx={{ mb: 30 }}>
            E-Mode info
          </Text>
          <EModeInfo reserve={reserve} />
        </>
      )} */}
    </>
  )
}
