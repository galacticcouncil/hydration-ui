import { isGho } from "@galacticcouncil/money-market/utils"
import {
  Flex,
  LinkTextButton,
  Stack,
  Text,
  Tooltip,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
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
  gigaTotalLockedQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { STAKING_DOCS_LINK } from "@/config/links"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman, toDecimal } from "@/utils/formatting"

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

  const { data: exchangeRate } = useGigaStakeExchangeRate()

  const { data: gigaBorrowSummary, isSuccess } = useUserGigaBorrowSummary()
  const userGhdxHuman = gigaBorrowSummary?.hdxReserve?.underlyingBalance ?? "0"

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

  // Convert user GIGAHDX × rate → HDX planck. Returns the default reference
  // when the user has no position (or no rate yet).
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
    total,
    passive: aprPassive,
    voting: aprVoting,
    isLoading: isAprLoading,
  } = useGigaApr(aprReferenceStake)

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

  const hollarReserve = gigaPoolReserves?.formattedReserves.find((reserve) =>
    isGho(reserve),
  )
  const { data: facilitatorBucketData, isLoading: isFacilitatorBucketLoading } =
    useFacilitatorBucket(hollarReserve?.aTokenAddress ?? "")

  const { data: gigaLockedHDX, isLoading: isGigaLockedHDXLoading } = useQuery(
    gigaTotalLockedQuery(useRpcProvider()),
  )

  const totalGigaSupplied = scaleHuman(gigaLockedHDX ?? 0n, native.decimals)

  const [totalGigaSuppliedUsd, { isLoading: isTotalGigaSuppliedUsdLoading }] =
    useDisplayAssetPrice(native.id, totalGigaSupplied)

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
        isLoading={isGigaLockedHDXLoading || isTotalGigaSuppliedUsdLoading}
        value={
          isSuccess
            ? t("currency.compact", {
                value: totalGigaSupplied,
                symbol: native.symbol,
              })
            : "-"
        }
        bottomLabel={isSuccess ? totalGigaSuppliedUsd : "-"}
      />
      <Tooltip asChild={false} text={<ProjectedAPRTooltipContent />}>
        <ValueStats
          wrap
          size="medium"
          label={t("staking:dashboard.projectedAPR")}
          isLoading={isAprLoading}
          customValue={
            <ValueStatsValue size="medium">
              {t("percent", {
                value: Number(total.toFixed(2)),
              })}
            </ValueStatsValue>
          }
          customBottomLabel={
            <Text fs="p7" lh={1} color={getToken("accents.success.emphasis")}>
              {t("staking:dashboard.projectedAPR.summ", {
                voting: Number(aprVoting.toFixed(2)),
                base: Number(aprPassive.toFixed(2)),
              })}
            </Text>
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
        value={
          isSuccess
            ? t("currency", {
                value: availableToBorrow,
                symbol: hollarSymbol,
              })
            : "-"
        }
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
      <Text fw={600} fs="p6" lh={1.4} color={getToken("text.high")}>
        {lines[0]}
      </Text>

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

      <LinkTextButton href={STAKING_DOCS_LINK} direction="internal">
        {t("dashboard.projectedAPR.tooltip.docs")}
      </LinkTextButton>
    </Flex>
  )
}
