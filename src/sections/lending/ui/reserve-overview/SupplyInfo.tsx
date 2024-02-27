import { valueToBigNumber } from "@aave/math-utils"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Alert } from "components/Alert"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PercentageValue } from "components/PercentageValue"
import { CapsCircularStatus } from "sections/lending/components/caps/CapsCircularStatus"
import { DebtCeilingStatus } from "sections/lending/components/caps/DebtCeilingStatus"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapHookData } from "sections/lending/hooks/useAssetCaps"
import { ApyGraphContainer } from "sections/lending/modules/reserve-overview/graphs/ApyGraphContainer"
import { IncentivesButton } from "sections/lending/ui/incentives/IncentivesButton"
import { MarketDataType } from "sections/lending/utils/marketsAndNetworksConfig"

type SupplyInfoProps = {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  renderCharts: boolean
  showSupplyCapStatus: boolean
  supplyCap: AssetCapHookData
  debtCeiling: AssetCapHookData
}

export const SupplyInfo = ({
  reserve,
  currentMarketData,
  renderCharts,
  showSupplyCapStatus,
  supplyCap,
  debtCeiling,
}: SupplyInfoProps) => {
  const { t } = useTranslation()

  const hasUnbacked = reserve.unbacked && reserve.unbacked !== "0"

  const CapProgress = () => (
    <CapsCircularStatus
      value={supplyCap.percentUsed}
      tooltipContent={
        <Text fs={12}>
          Maximum amount available to supply is{" "}
          {t("value.compact", {
            value:
              valueToBigNumber(reserve.supplyCap).toNumber() -
              valueToBigNumber(reserve.totalLiquidity).toNumber(),
          })}
          &nbsp;
          {reserve.symbol} (
          <DisplayValue
            isUSD
            compact
            value={
              valueToBigNumber(reserve.supplyCapUSD).toNumber() -
              valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
            }
          />
          ).
        </Text>
      }
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
        {showSupplyCapStatus && (
          <div sx={{ display: ["none", "block"] }}>
            <CapProgress />
          </div>
        )}
        <div sx={{ width: ["100%", hasUnbacked ? "60%" : "40%"], mb: 10 }}>
          <DataValueList separated>
            {showSupplyCapStatus ? (
              <DataValue
                label={
                  <div sx={{ flex: "column", gap: 10 }}>
                    <Text
                      color="basic400"
                      fs={14}
                      sx={{ flex: "row", gap: 4, align: "center" }}
                    >
                      Total supplied{" "}
                      <InfoTooltip text="Asset supply is limited to a certain amount to reduce protocol exposure to the asset and to help manage risks involved.">
                        <SInfoIcon />
                      </InfoTooltip>
                    </Text>
                    <div sx={{ display: ["block", "none"] }}>
                      <CapProgress />
                    </div>
                  </div>
                }
                labelColor="basic400"
                font="ChakraPetchBold"
              >
                {t("value.compact", { value: Number(reserve.totalLiquidity) })}
                <span
                  sx={{
                    display: "inline-block",
                    mx: 4,
                    color: "basic400",
                  }}
                >
                  of
                </span>
                {t("value.compact", { value: Number(reserve.supplyCap) })}
                <Text
                  fs={12}
                  font="ChakraPetch"
                  color="basic500"
                  tAlign={["right", "left"]}
                >
                  <DisplayValue
                    value={Number(reserve.totalLiquidityUSD)}
                    isUSD
                    compact
                  />
                  <span sx={{ display: "inline-block", mx: 4 }}>
                    <span>of</span>
                  </span>
                  <DisplayValue
                    value={Number(reserve.supplyCapUSD)}
                    isUSD
                    compact
                  />
                </Text>
              </DataValue>
            ) : (
              <DataValue
                label="Total supplied"
                labelColor="basic400"
                font="ChakraPetchBold"
              >
                {t("value.compact", { value: Number(reserve.totalLiquidity) })}
                <Text
                  fs={12}
                  font="ChakraPetch"
                  color="basic500"
                  tAlign={["right", "left"]}
                >
                  <DisplayValue
                    value={Number(reserve.totalLiquidityUSD)}
                    isUSD
                    compact
                  />
                </Text>
              </DataValue>
            )}
            <DataValue label="APY" labelColor="basic400" font="ChakraPetchBold">
              <PercentageValue value={Number(reserve.supplyAPY) * 100} />
              <div sx={{ mt: 2 }}>
                <IncentivesButton
                  symbol={reserve.symbol}
                  incentives={reserve.aIncentivesData}
                />
              </div>
            </DataValue>
            {hasUnbacked && (
              <DataValue
                label="Unbacked"
                font="ChakraPetchBold"
                labelColor="basic400"
              >
                {t("value.displaySymbol", {
                  value: Number(reserve.unbacked),
                  symbol: reserve.symbol,
                })}
                <Text fs={12} font="ChakraPetch" color="basic500">
                  <DisplayValue
                    value={Number(reserve.unbackedUSD)}
                    isUSD
                    compact
                  />
                </Text>
              </DataValue>
            )}
          </DataValueList>
        </div>
      </div>
      {renderCharts &&
        (reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
          <ApyGraphContainer
            graphKey="supply"
            reserve={reserve}
            currentMarketData={currentMarketData}
          />
        )}
      <div sx={{ mb: 10, mt: 20 }}>
        {reserve.isIsolated ? (
          <div>
            <Text fs={14} sx={{ mb: 10 }}>
              Collateral usage
            </Text>
            <Alert variant="warning" sx={{ color: "white" }}>
              <Text fs={14} font="ChakraPetchSemiBold" sx={{ mb: 4 }}>
                Asset can only be used as collateral in isolation mode only.
              </Text>
              <span>
                In Isolation mode you cannot supply other assets as collateral
                for borrowing. Assets used as collateral in Isolation mode can
                only be borrowed to a specific debt ceiling.{" "}
                <a
                  target="_blank"
                  href="https://docs.aave.com/faq/aave-v3-features#isolation-mode"
                  rel="noreferrer"
                >
                  Learn more
                </a>
              </span>
            </Alert>
          </div>
        ) : reserve.reserveLiquidationThreshold !== "0" ? (
          <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
            <Text fs={14}>Collateral usage</Text>
            <Text
              fs={14}
              color="green400"
              sx={{ flex: "row", align: "center" }}
            >
              <CheckIcon width={14} height={14} sx={{ mr: 4 }} />
              <span>Can be collateral</span>
            </Text>
          </div>
        ) : (
          <div>
            <Text fs={14} sx={{ mb: 10 }}>
              Collateral usage
            </Text>
            <Alert size="small" variant="warning">
              <Text fs={14}>Asset cannot be used as collateral.</Text>
            </Alert>
          </div>
        )}
      </div>
      {reserve.reserveLiquidationThreshold !== "0" && (
        <>
          <DataValueList sx={{ mt: 20 }}>
            <DataValue
              label="Max LTV"
              labelColor="basic400"
              font="ChakraPetch"
              size="small"
              tooltip="The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral."
            >
              <PercentageValue
                value={Number(reserve.formattedBaseLTVasCollateral) * 100}
              />
            </DataValue>
            <DataValue
              label="Liquidation threshold"
              labelColor="basic400"
              font="ChakraPetch"
              size="small"
              tooltip="This represents the threshold at which a borrow position will be considered undercollateralized and subject to liquidation for each collateral. For example, if a collateral has a liquidation threshold of 80%, it means that the position will be liquidated when the debt value is worth 80% of the collateral value."
            >
              <PercentageValue
                value={
                  Number(reserve.formattedReserveLiquidationThreshold) * 100
                }
              />
            </DataValue>
            <DataValue
              label="Liquidation penalty"
              labelColor="basic400"
              font="ChakraPetch"
              size="small"
              tooltip="When a liquidation occurs, liquidators repay up to 50% of the outstanding borrowed amount on behalf of the borrower. In return, they can buy the collateral at a discount and keep the difference (liquidation penalty) as a bonus."
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
      )}
    </>
  )
}
