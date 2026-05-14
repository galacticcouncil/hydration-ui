import {
  HDX_ERC20_ASSET_ID,
  STHDX_ASSET_ID,
} from "@galacticcouncil/money-market/ui-config"
import { isGho } from "@galacticcouncil/money-market/utils"
import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToHours } from "date-fns"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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

  const cooldownPeriodDays =
    millisecondsToHours((constants?.cooldownPeriod ?? 0) * rpc.slotDurationMs) /
    24

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

  const borrowedHollar = toDecimal(
    facilitatorBucketData?.facilitatorBucketLevel ?? "0",
    hollarReserve?.decimals ?? 18,
  )

  const availableToBorrow = Big(maxBorrowHollar)
    .minus(borrowedHollar)
    .toString()
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
          value: cooldownPeriodDays,
        })}
      />
      <ValueStats
        wrap
        size="medium"
        label={t("staking:gigaStake.header.availableToBorrow")}
        isLoading={isGigaPoolReservesLoading || isFacilitatorBucketLoading}
        value={t("currency", {
          value: availableToBorrow,
          symbol: hollarSymbol,
        })}
      />
    </Stack>
  )
}
