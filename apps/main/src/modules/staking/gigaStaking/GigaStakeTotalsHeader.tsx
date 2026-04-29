import {
  HDX_ERC20_ASSET_ID,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
import { isGho } from "@galacticcouncil/money-market/utils"
import { Stack, Text, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { secondsToHours } from "date-fns"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import {
  borrowReservesQuery,
  gigaLendingPoolAddressProvider,
  useFacilitatorBucket,
} from "@/api/borrow"
import { useBorrowPoolDataContract } from "@/api/borrow/contracts"
import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

export const GigaStakeTotalsHeader: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { getAssetWithFallback } = useAssets()
  const hdxAsset = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const { data: constants, isLoading: isConstantsLoading } = useQuery(
    gigaStakeConstantsQuery(rpc),
  )
  const cooldownPeriod = secondsToHours(constants?.cooldownPeriod ?? 0) / 24
  const { data: gigaPoolReserves, isLoading: isGigaPoolReservesLoading } =
    useQuery(
      borrowReservesQuery(
        rpc,
        gigaLendingPoolAddressProvider,
        poolDataContract,
        null,
      ),
    )

  const hdxReserve = gigaPoolReserves?.formattedReserves.find(
    (reserve) =>
      reserve.underlyingAsset === getAddressFromAssetId(STHDX_ASSET_ID),
  )
  const hollarReserve = gigaPoolReserves?.formattedReserves.find((reserve) =>
    isGho(reserve),
  )
  const { data: facilitatorBucketData, isLoading: isFacilitatorBucketLoading } =
    useFacilitatorBucket(hollarReserve?.aTokenAddress ?? "")

  const totalSupplied = hdxReserve?.totalLiquidity ?? "0"
  const totalSuppliedUsd = hdxReserve?.totalLiquidityUSD ?? "0"
  const maxBorrowHollar = toDecimal(
    facilitatorBucketData?.facilitatorBucketCapacity ?? "0",
    hollarReserve?.decimals ?? 18,
  )

  const borrowedHollar = hollarReserve?.totalDebt ?? "0"
  const hollarSymbol = hollarReserve?.symbol

  return (
    <Stack
      direction={["column", null, "row"]}
      gap={["base", null, "xxxl", "3.75rem"]}
      separated
    >
      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.totalStake")}
        isLoading={isGigaPoolReservesLoading}
        value={t("currency.compact", {
          value: totalSupplied,
          symbol: hdxAsset.symbol,
        })}
        bottomLabel={t("currency", { value: totalSuppliedUsd })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("staking:dashboard.projectedAPR")}
        isLoading={false}
        value={t("percent", { value: 10 })}
      />

      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.minimumLockPeriod")}
        isLoading={isConstantsLoading}
        value={t("staking:gigaStake.header.valueDays", {
          value: cooldownPeriod,
        })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.currentBorrowLimits")}
        isLoading={isGigaPoolReservesLoading || isFacilitatorBucketLoading}
        value={t("currency", { value: maxBorrowHollar, symbol: hollarSymbol })}
        customValue={
          <Text fs="h6" fw={500} color={getToken("text.high")} font="primary">
            <Trans
              t={t}
              i18nKey="staking:gigaStake.header.currentBorrowLimits.value"
              values={{
                value: borrowedHollar,
                max: maxBorrowHollar,
                symbol: hollarSymbol,
              }}
              components={[
                <Text
                  key="max-limit"
                  as="span"
                  fs="h6"
                  color={getToken("text.low")}
                  font="primary"
                />,
              ]}
            />
          </Text>
        }
      />
    </Stack>
  )
}
