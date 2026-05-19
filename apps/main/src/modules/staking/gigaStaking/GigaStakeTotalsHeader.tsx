import { STHDX_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { isGho } from "@galacticcouncil/money-market/utils"
import {
  Stack,
  Tooltip,
  ValueStats,
  ValueStatsBottomValue,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
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
  useUserGigaBorrowSummary,
} from "@/api/borrow"
import { useBorrowPoolDataContract } from "@/api/borrow/contracts"
import { useGigaApr } from "@/api/gigaApr"
import {
  gigaStakeConstantsQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

/**
 * Reference stake (in HDX planck) used as the dilution input for the fleet
 * voting APR when the connected wallet has no GIGAHDX position (or no wallet
 * is connected at all). Picked so the projection doesn't degenerate into the
 * "marginal voter grabs the whole pool" limit on chains with few voters,
 * while still being small enough to represent a realistic new-staker entry.
 *
 * 1,000 HDX — a plausible "I'm trying staking out" amount.
 */
const DEFAULT_REFERENCE_STAKE_HDX_PLANCK = 1_000n * 10n ** 12n

export const GigaStakeTotalsHeader: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const poolDataContract = useBorrowPoolDataContract()
  const { data: constants, isLoading: isConstantsLoading } = useQuery(
    gigaStakeConstantsQuery(rpc),
  )

  //@TODO: review this
  const { data: exchangeRate, isLoading: isExchangeRateLoading } =
    useGigaStakeExchangeRate()
  // Fleet APR — always projected at maximum conviction (Locked6x = 8×).
  // Dilution reference: the connected user's actual GIGAHDX position (in HDX
  // equivalent) when present, falling back to `DEFAULT_REFERENCE_STAKE_HDX_PLANCK`
  // otherwise. Using a non-zero reference avoids the "marginal voter grabs
  // the whole pool" pathological limit that distorts the headline on chains
  // with few voters. The displayed label stays "up to X% voting" — the user's
  // realised yield can be less if they vote at lower conviction or skip refs.
  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()
  const userGhdxHuman = gigaBorrowSummary?.hdxReserve?.underlyingBalance ?? "0"
  // Convert user GIGAHDX × rate → HDX planck. Returns the default reference
  // when the user has no position (or no rate yet).
  const aprReferenceStake = (() => {
    if (!exchangeRate) return DEFAULT_REFERENCE_STAKE_HDX_PLANCK
    const ghdxBig = Big(userGhdxHuman)
    if (ghdxBig.lte(0)) return DEFAULT_REFERENCE_STAKE_HDX_PLANCK
    const hdxHuman = ghdxBig.times(exchangeRate.toString())
    return BigInt(
      hdxHuman.times(`1e${native.decimals}`).round(0, Big.roundDown).toString(),
    )
  })()
  // We render passive and voting on separate lines (Option 2 split) to make
  // the conditionality of voting APR explicit — a passive holder earns only
  // the base component; voting is "+ up to X% if you vote at max conviction".
  const {
    passive: aprPassive,
    voting: aprVoting,
    isLoading: isAprLoading,
  } = useGigaApr(aprReferenceStake)
  //end
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

  const totalSuppliedHdx = Big(totalSupplied)
    .times(exchangeRate?.toString() || "0")
    .toString()
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
        isLoading={isGigaPoolReservesLoading || isExchangeRateLoading}
        value={t("currency.compact", {
          value: totalSuppliedHdx,
          symbol: native.symbol,
        })}
        bottomLabel={t("currency", { value: totalSuppliedUsd })}
      />
      <Tooltip
        asChild={false}
        text={
          t("staking:dashboard.projectedAPR.tooltip", {
            returnObjects: true,
          }) as Array<string>
        }
      >
        <ValueStats
          wrap
          size="medium"
          label={t("staking:dashboard.projectedAPR")}
          isLoading={isAprLoading}
          customValue={
            <ValueStatsValue size="medium">
              {t("staking:dashboard.projectedAPR.base", {
                value: Number(aprPassive.toFixed(2)),
              })}
            </ValueStatsValue>
          }
          customBottomLabel={
            <ValueStatsBottomValue>
              {t("staking:dashboard.projectedAPR.voting", {
                value: Number(aprVoting.toFixed(2)),
              })}
            </ValueStatsBottomValue>
          }
        />
      </Tooltip>

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
