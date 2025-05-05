import {
  Box,
  CircularProgress,
  Flex,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
/* import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapHookData } from "sections/lending/hooks/useAssetCaps"
import { MarketDataType } from "sections/lending/utils/marketsAndNetworksConfig" */

type SupplyInfoProps = {
  reserve: any
  currentMarketData: any
  renderCharts: boolean
  showSupplyCapStatus: boolean
  supplyCap: any
  debtCeiling: any
  borrow?: boolean
}

export const SupplyInfo = ({
  reserve,
  currentMarketData,
  renderCharts,
  showSupplyCapStatus,
  supplyCap,
  debtCeiling,
  borrow = false,
}: SupplyInfoProps) => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <>
      <Flex
        direction={["column", "row"]}
        gap={[20, 40]}
        mb={20}
        align={["start", "center"]}
      >
        <Box
          sx={{
            display: ["none", "block"],
            color: borrow
              ? getToken("colors.utility.red.400")
              : getToken("colors.successGreen.400"),
          }}
        >
          <CircularProgress
            radius={45}
            thickness={3}
            percent={borrow ? 75 : 43}
          />
        </Box>
        <Stack gap={40} direction="row" separated>
          {showSupplyCapStatus ? (
            <ValueStats
              size="small"
              alwaysWrap
              label={t("borrow:totalSupplied")}
              value={t("borrow:cap.range", {
                valueA: reserve.totalLiquidity,
                valueB: reserve.supplyCap,
              })}
              bottomLabel={t("borrow:cap.range.usd", {
                valueA: reserve.totalLiquidityUSD,
                valueB: reserve.supplyCapUSD,
              })}
            />
          ) : (
            <ValueStats
              size="small"
              alwaysWrap
              label={t("borrow:totalSupplied")}
              customValue={
                <>
                  {t("number", {
                    value: Number(reserve.totalLiquidity),
                  })}
                  <Text fs={12} color="basic500" align={["right", "left"]}>
                    {Number(reserve.totalLiquidityUSD)}
                  </Text>
                </>
              }
            ></ValueStats>
          )}
          <ValueStats
            size="small"
            alwaysWrap
            label={t("apy")}
            value={t("percent", {
              value: 20,
            })}
          />
        </Stack>
      </Flex>
      <Text mb={6}>Collateral Usage</Text>
      <Stack direction="row" gap={40}>
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
      {/* {renderCharts &&
        (reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
          <ApyChartContainer
            type="supply"
            reserve={reserve}
            currentMarketData={currentMarketData}
          />
        )}
      <div sx={{ mb: 10, mt: 20 }}>
        {reserve.isIsolated ? (
          <div>
            <Text
              fs={14}
              sx={{ mb: 10 }}
              css={{ textTransform: "uppercase" }}
              font="GeistSemiBold"
            >
              {t("lending.collateralUsage")}
            </Text>
            <Alert variant="warning" sx={{ color: "white" }}>
              <Text fs={13} font="GeistSemiBold" sx={{ mb: 4 }}>
                {t("lending.supply.isolatedCollateral.title")}
              </Text>
              <Text fs={13}>
                {t("lending.supply.isolatedCollateral.description")}
              </Text>
            </Alert>
          </div>
        ) : reserve.reserveLiquidationThreshold !== "0" ? (
          <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
            <Text
              fs={14}
              css={{ textTransform: "uppercase" }}
              font="GeistSemiBold"
            >
              {t("lending.collateralUsage")}
            </Text>
            <Text
              fs={14}
              color="green400"
              sx={{ flex: "row", align: "center" }}
            >
              <CheckIcon width={14} height={14} sx={{ mr: 4 }} />
              {t("lending.supply.table.canBeCollateral")}
            </Text>
          </div>
        ) : (
          <div>
            <Text
              fs={14}
              sx={{ mb: 10 }}
              css={{ textTransform: "uppercase" }}
              font="GeistSemiBold"
            >
              {t("lending.collateralUsage")}
            </Text>
            <Alert variant="warning">
              <Text fs={14}>{t("lending.supply.assetCannotBeCollateral")}</Text>
            </Alert>
          </div>
        )}
      </div>
      {reserve.reserveLiquidationThreshold !== "0" && (
        <>
          <DataValueList sx={{ mt: 20 }}>
            <DataValue
              label={t("lending.maxLTV")}
              labelColor="basic400"
              font="Geist"
              size="small"
              tooltip={t("lending.tooltip.maxLTV")}
            >
              <PercentageValue
                value={Number(reserve.formattedBaseLTVasCollateral) * 100}
              />
            </DataValue>
            <DataValue
              label={t("lending.risk.liquidationThreshold")}
              labelColor="basic400"
              font="Geist"
              size="small"
              tooltip={t("lending.tooltip.liquidationThreshold")}
            >
              <PercentageValue
                value={
                  Number(reserve.formattedReserveLiquidationThreshold) * 100
                }
              />
            </DataValue>
            <DataValue
              label={t("lending.risk.liquidationPenalty")}
              labelColor="basic400"
              font="Geist"
              size="small"
              tooltip={t("lending.tooltip.liquidationPenalty")}
            >
              <PercentageValue
                value={Number(reserve.formattedReserveLiquidationBonus) * 100}
              />
            </DataValue>
          </DataValueList>
          {reserve.isIsolated && (
            <DebtCeilingStatus
              sx={{ mt: 16 }}
              debt={reserve.isolationModeTotalDebtUSD}
              ceiling={reserve.debtCeilingUSD}
              usageData={debtCeiling}
            />
          )}
        </>
      )} */}
    </>
  )
}
