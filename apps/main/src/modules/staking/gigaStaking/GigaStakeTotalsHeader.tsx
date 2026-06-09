import { STHDX_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { isGho } from "@galacticcouncil/money-market/utils"
import {
  Flex,
  Stack,
  Text,
  Tooltip,
  ValueStats,
  ValueStatsBottomValue,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsToHours } from "date-fns"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { TokenLockType, useNativeTokenLocks } from "@/api/balances"
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
import { useAccountBalances } from "@/states/account"
import { toDecimal } from "@/utils/formatting"

/**
 * Reference stake (in HDX planck) used as the dilution input for the
 * voting APR when the connected wallet has no GIGAHDX position AND no
 * unstaked HDX in their wallet (or no wallet is connected at all).
 *
 * Picked so the projection doesn't degenerate into the "marginal voter
 * grabs the whole pool" limit on chains with few voters, while still
 * being small enough to represent a realistic new-staker entry.
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

  const { data: gigaBorrowSummary } = useUserGigaBorrowSummary()
  const userGhdxHuman = gigaBorrowSummary?.hdxReserve?.underlyingBalance ?? "0"
  // Spendable HDX in the wallet (i.e. what the user could in theory stake
  // right now). Same derivation `GigaStake.utils.ts` uses for the "MAX"
  // button: free balance minus any in-flight lock from other pallets
  // (vested unlock, classic staking, prior gigastaking).
  const { getBalance } = useAccountBalances()
  const nativeBalance = getBalance(native.id)
  const { data: locksData } = useNativeTokenLocks()
  const stakeableHdxPlanck = (() => {
    if (!nativeBalance) return 0n
    const free = BigInt(nativeBalance.free.toString())
    const vested = locksData?.get(TokenLockType.Vesting) ?? 0n
    const classicStake = locksData?.get(TokenLockType.Staking) ?? 0n
    const gigaStaked = locksData?.get(TokenLockType.GigaStaking) ?? 0n
    const spendable = free - vested - classicStake - gigaStaked
    return spendable > 0n ? spendable : 0n
  })()

  // Voting-APR reference stake = what the user currently has staked PLUS
  // what they could add by staking their free HDX. This is the "if I went
  // all-in" projection — answers the question "what could I realistically
  // earn with everything I have available?". Falls back to a default
  // reference (1,000 HDX) only when both pieces are zero, so the headline
  // never collapses to the noisy marginal-voter limit.
  const stakedHdxPlanck = (() => {
    if (!exchangeRate) return 0n
    const ghdxBig = Big(userGhdxHuman)
    if (ghdxBig.lte(0)) return 0n
    const hdxHuman = ghdxBig.times(exchangeRate.toString())
    return BigInt(
      hdxHuman.times(`1e${native.decimals}`).round(0, Big.roundDown).toString(),
    )
  })()
  const totalReferenceStake = stakedHdxPlanck + stakeableHdxPlanck
  const aprReferenceStake =
    totalReferenceStake > 0n
      ? totalReferenceStake
      : DEFAULT_REFERENCE_STAKE_HDX_PLANCK
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
      <Tooltip asChild={false} text={<ProjectedAPRTooltipContent />}>
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

export const ProjectedAPRTooltipContent = () => {
  const { t } = useTranslation("staking")
  const lines = t("dashboard.projectedAPR.tooltip", {
    returnObjects: true,
  }) as Array<string>

  return (
    <Flex direction="column" gap="m">
      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Trans t={t} i18nKey="gigaStaking.projectedAPR.base.tooltip">
          <Text fw={600} />
        </Trans>
      </Text>

      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Trans t={t} i18nKey="gigaStaking.projectedAPR.voting.tooltip">
          <Text fw={600} />
        </Trans>
      </Text>

      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
        {lines[3]}
      </Text>
    </Flex>
  )
}
