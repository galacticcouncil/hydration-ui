import {
  AreaChart,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { InterestRateModelChart } from "@/modules/borrow/reserve/components/InterestRateModelChart"
import { SupplyInfo } from "@/modules/borrow/reserve/components/SupplyInfo"

type ReserveConfigurationProps = {
  reserve: any
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
  const renderCharts = false
  const showSupplyCapStatus = true
  const showBorrowCapStatus = true

  const shouldRenderBorrowInfo = true

  const shouldRenderEModeInfo = true

  return (
    <>
      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Supply info
      </Text>
      <SupplyInfo
        reserve={reserve}
        currentMarketData={{}}
        renderCharts={renderCharts}
        showSupplyCapStatus={showSupplyCapStatus}
        supplyCap={"0"}
        debtCeiling={"0"}
      />

      <ReserveSectionDivider />

      <Text fs="p3" fw={500} sx={{ mb: 30 }}>
        Borrow info
      </Text>

      <SupplyInfo
        borrow
        reserve={reserve}
        currentMarketData={{}}
        renderCharts={renderCharts}
        showSupplyCapStatus={showSupplyCapStatus}
        supplyCap={"0"}
        debtCeiling={"0"}
      />

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
        size="medium"
        alwaysWrap
        label={"E-Mode Category"}
        customValue={"Stablecoins"}
      />

      <Stack direction="row" gap={40} sx={{ mt: 20 }}>
        <ValueStats
          size="medium"
          alwaysWrap
          label={"Max LTV"}
          value={t("percent", {
            value: 75,
          })}
        />
        <ValueStats
          size="medium"
          alwaysWrap
          label={"Liquidation Threshold"}
          value={t("percent", {
            value: 80,
          })}
        />
        <ValueStats
          size="medium"
          alwaysWrap
          label={"Liquidation Penalty"}
          value={t("percent", {
            value: 7,
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
