import { valueToBigNumber } from "@aave/math-utils"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { BigNumber } from "bignumber.js"
import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { CapsCircularStatus } from "sections/lending/components/caps/CapsCircularStatus"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapHookData } from "sections/lending/hooks/useAssetCaps"
import { ApyGraphContainer } from "sections/lending/modules/reserve-overview/graphs/ApyGraphContainer"
import { IncentivesButton } from "sections/lending/ui/incentives/IncentivesButton"
import {
  MarketDataType,
  NetworkConfig,
} from "sections/lending/utils/marketsAndNetworksConfig"

interface BorrowInfoProps {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  currentNetworkConfig: NetworkConfig
  renderCharts: boolean
  showBorrowCapStatus: boolean
  borrowCap: AssetCapHookData
}

export const BorrowInfo = ({
  reserve,
  currentMarketData,
  currentNetworkConfig,
  renderCharts,
  showBorrowCapStatus,
  borrowCap,
}: BorrowInfoProps) => {
  const { t } = useTranslation()
  const maxAvailableToBorrow = BigNumber.max(
    valueToBigNumber(reserve.borrowCap).minus(
      valueToBigNumber(reserve.totalDebt),
    ),
    0,
  ).toNumber()

  const maxAvailableToBorrowUSD = BigNumber.max(
    valueToBigNumber(reserve.borrowCapUSD).minus(
      valueToBigNumber(reserve.totalDebtUSD),
    ),
    0,
  ).toNumber()

  const hasBorrowCap = reserve.borrowCapUSD && reserve.borrowCapUSD !== "0"

  return (
    <>
      <div sx={{ flex: "row", gap: 20, mb: 20 }}>
        {showBorrowCapStatus && (
          <CapsCircularStatus
            value={borrowCap.percentUsed}
            tooltipContent={
              <Text fs={12}>
                <span>
                  Maximum amount available to borrow is{" "}
                  {t("value.compact", { value: maxAvailableToBorrow })}&nbsp;
                  {reserve.symbol} (
                  <DisplayValue isUSD compact value={maxAvailableToBorrowUSD} />
                  ).
                </span>
              </Text>
            }
          />
        )}
        <div sx={{ width: ["100%", hasBorrowCap ? "60%" : "40%"] }}>
          <DataValueList separated>
            {showBorrowCapStatus ? (
              <>
                <DataValue
                  label="Total borrowed"
                  labelColor="basic400"
                  font="ChakraPetchBold"
                  tooltip={
                    <Text fs={12}>
                      Borrowing of this asset is limited to a certain amount to
                      minimize liquidity pool insolvency.{" "}
                      <a
                        css={{ textDecoration: "underline" }}
                        target="_blank"
                        href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
                        rel="noreferrer"
                      >
                        Learn more
                      </a>
                    </Text>
                  }
                >
                  {t("value.compact", { value: Number(reserve.totalDebt) })}
                  <span sx={{ display: "inline-block", mx: 4 }}>of</span>
                  {t("value.compact", { value: Number(reserve.borrowCap) })}
                  <Text
                    fs={12}
                    font="ChakraPetch"
                    color="basic500"
                    css={{ position: "absolute", top: "100%" }}
                  >
                    <DisplayValue
                      value={Number(reserve.totalDebtUSD)}
                      isUSD
                      compact
                    />
                    <span sx={{ display: "inline-block", mx: 4 }}>
                      <span>of</span>
                    </span>
                    <DisplayValue
                      value={Number(reserve.borrowCapUSD)}
                      isUSD
                      compact
                    />
                  </Text>
                </DataValue>
              </>
            ) : (
              <DataValue
                label="Total borrowed"
                labelColor="basic400"
                font="ChakraPetchBold"
              >
                {t("value.compact", { value: Number(reserve.totalDebt) })}
                <Text
                  fs={12}
                  font="ChakraPetch"
                  color="basic500"
                  css={{ position: "absolute", top: "100%" }}
                >
                  <DisplayValue
                    value={Number(reserve.totalDebtUSD)}
                    isUSD
                    compact
                  />
                </Text>
              </DataValue>
            )}
            <DataValue
              label="APY, variable"
              labelColor="basic400"
              font="ChakraPetchBold"
            >
              {t("value.percentage", {
                value: +reserve.variableBorrowAPY * 100,
              })}
              <div sx={{ mt: 2 }} css={{ position: "absolute", top: "100%" }}>
                <IncentivesButton
                  symbol={reserve.symbol}
                  incentives={reserve.vIncentivesData}
                />
              </div>
            </DataValue>
            {hasBorrowCap && (
              <DataValue
                label="Borrow cap"
                labelColor="basic400"
                font="ChakraPetchBold"
              >
                {t("value.compact", { value: Number(reserve.borrowCap) })}
                <Text
                  fs={12}
                  font="ChakraPetch"
                  color="basic500"
                  css={{ position: "absolute", top: "100%" }}
                >
                  <DisplayValue
                    value={Number(reserve.borrowCapUSD)}
                    isUSD
                    compact
                  />
                </Text>
              </DataValue>
            )}
          </DataValueList>
        </div>
      </div>
      {renderCharts && (
        <ApyGraphContainer
          graphKey="borrow"
          reserve={reserve}
          currentMarketData={currentMarketData}
        />
      )}
      {currentMarketData.addresses.COLLECTOR && (
        <>
          <div sx={{ mt: 20 }}>
            <Text fs={14} sx={{ mb: 10 }}>
              Collector info
            </Text>
          </div>
          <div sx={{ flex: "row", gap: [20, 40] }}>
            <DataValue
              label="Reserve factor"
              labelColor="basic400"
              font="ChakraPetch"
              size="small"
              tooltip={
                <Text fs={12}>
                  Reserve factor is a percentage of interest which goes to a{" "}
                  <a
                    target="_blank"
                    css={{ textDecoration: "underline" }}
                    href={currentMarketData.addresses.COLLECTOR}
                    rel="noreferrer"
                  >
                    collector contract
                  </a>{" "}
                  that is controlled by Aave governance to promote ecosystem
                  growth.
                </Text>
              }
            >
              {t("value.percentage", { value: +reserve.reserveFactor * 100 })}
            </DataValue>
            <DataValue
              label="Collector Contract"
              labelColor="basic400"
              font="ChakraPetch"
              size="small"
            >
              <a
                target="_blank"
                href={currentNetworkConfig.explorerLinkBuilder({
                  address: currentMarketData.addresses.COLLECTOR,
                })}
                rel="noreferrer"
                css={{ textDecoration: "underline" }}
              >
                View contract{" "}
                <LinkIcon width={10} height={10} sx={{ color: "basic500" }} />
              </a>
            </DataValue>
          </div>
        </>
      )}
    </>
  )
}
