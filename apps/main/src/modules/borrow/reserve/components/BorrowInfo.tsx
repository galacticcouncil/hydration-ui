import {
  AssetCapHookData,
  ComputedReserveData,
} from "@galacticcouncil/money-market/hooks"
import { MarketDataType } from "@galacticcouncil/money-market/utils"
import { Flex, Stack, Text, ValueStats } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { BorrowApyChart } from "@/modules/borrow/reserve/components/BorrowApyChart"
import { CapProgressCircle } from "@/modules/borrow/reserve/components/CapProgressCircle"

type BorrowInfoProps = {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  showBorrowCapStatus: boolean
  borrowCap: AssetCapHookData
}

export const BorrowInfo = ({
  reserve,
  currentMarketData,
  showBorrowCapStatus,
  borrowCap,
}: BorrowInfoProps) => {
  const { t } = useTranslation(["common", "borrow"])

  const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
  const hasBorrowCap = reserve.borrowCapUSD && reserve.borrowCapUSD !== "0"

  const maxAvailableToBorrow = Math.max(
    Big(reserve.borrowCap).minus(reserve.totalDebt).toNumber(),
    0,
  )

  const maxAvailableToBorrowUSD = Math.max(
    Big(reserve.borrowCapUSD).minus(reserve.totalDebtUSD).toNumber(),
    0,
  )

  return (
    <>
      <Flex
        direction={["column", "row"]}
        gap={[20, 40]}
        align={["start", "center"]}
      >
        {showBorrowCapStatus && (
          <CapProgressCircle
            radius={[16, 56]}
            thickness={3}
            labelPosition={["end", "center"]}
            percent={borrowCap.percentUsed}
            tooltip={t("borrow:borrow.cap.tooltip", {
              value: maxAvailableToBorrow,
              tokenSymbol: reserve.symbol,
              usdValue: maxAvailableToBorrowUSD,
            })}
          />
        )}

        <Stack
          gap={[10, 40]}
          direction={["column", "row"]}
          justify="start"
          separated
          width="100%"
        >
          {showBorrowCapStatus ? (
            <ValueStats
              size="small"
              font="secondary"
              wrap
              label={t("borrow:market.table.totalBorrowed")}
              value={t("borrow:cap.range", {
                valueA: reserve.totalDebt,
                valueB: reserve.borrowCap,
              })}
              bottomLabel={t("borrow:cap.range.usd", {
                valueA: reserve.totalDebtUSD,
                valueB: reserve.borrowCapUSD,
              })}
            />
          ) : (
            <ValueStats
              size="small"
              font="secondary"
              wrap
              label={t("borrow:market.table.totalBorrowed")}
              value={t("number", { value: reserve.totalDebt })}
              bottomLabel={t("currency", {
                value: reserve.totalDebtUSD,
              })}
            />
          )}

          <ValueStats
            size="small"
            font="secondary"
            wrap
            label={t("borrow:apy.variable")}
            value={t("percent", {
              value: Number(reserve.variableBorrowAPY) * 100,
            })}
          />

          {hasBorrowCap && (
            <ValueStats
              size="small"
              font="secondary"
              wrap
              label={t("borrow:borrow.cap")}
              value={t("number.compact", { value: reserve.borrowCap })}
              bottomLabel={t("currency.compact", {
                value: reserve.borrowCapUSD,
              })}
            />
          )}
        </Stack>
      </Flex>

      <Flex direction="column" gap={14}>
        <BorrowApyChart assetId={assetId} />

        {currentMarketData.addresses.COLLECTOR && (
          <>
            <Text fs={14} mb={10} fw={500} transform="uppercase">
              {t("borrow:collector.info")}
            </Text>
            <Stack direction="row" gap={10} mt={20}>
              <ValueStats
                size="small"
                font="secondary"
                wrap
                label={t("borrow:reserve.factor")}
                value={t("percent", {
                  value: Number(reserve.reserveFactor) * 100,
                })}
              />
            </Stack>
          </>
        )}
      </Flex>
    </>
  )
}
