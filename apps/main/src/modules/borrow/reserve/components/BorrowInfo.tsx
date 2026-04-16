import {
  AssetCapHookData,
  ComputedReserveData,
} from "@galacticcouncil/money-market/hooks"
import { MarketDataType } from "@galacticcouncil/money-market/utils"
import {
  Box,
  Flex,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
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
      <Stack
        gap={["m", "xxxl"]}
        direction={["column", "row"]}
        justify="start"
        align={[null, "center"]}
        separated
        width="100%"
        mb="base"
        separator={
          <Separator orientation="vertical" sx={{ height: [1, 50] }} />
        }
      >
        <Flex gap={["m", "xxxl"]} justify="space-between" align="center">
          {showBorrowCapStatus && (
            <CapProgressCircle
              radius={[16, 46]}
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
        </Flex>

        <ValueStats
          size="small"
          font="secondary"
          wrap={[false, true]}
          label={t("borrow:apy.variable")}
          value={t("percent", {
            value: Number(reserve.variableBorrowAPY) * 100,
          })}
        />

        {hasBorrowCap && (
          <ValueStats
            size="small"
            font="secondary"
            wrap={[false, true]}
            label={t("borrow:borrow.cap")}
            value={t("number.compact", { value: reserve.borrowCap })}
            bottomLabel={t("currency.compact", {
              value: reserve.borrowCapUSD,
            })}
          />
        )}
      </Stack>

      <Flex direction="column" gap="xl">
        <BorrowApyChart assetId={assetId} />

        {currentMarketData.addresses.COLLECTOR && (
          <Box>
            <Text fs="p3" mb="base" fw={500} transform="uppercase">
              {t("borrow:collector.info")}
            </Text>
            <Stack direction="row" gap="base" mt="xl">
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
          </Box>
        )}
      </Flex>
    </>
  )
}
