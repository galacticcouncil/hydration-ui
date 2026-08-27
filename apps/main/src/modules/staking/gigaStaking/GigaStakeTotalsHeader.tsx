import { isGho } from "@galacticcouncil/money-market/utils"
import {
  Flex,
  Grid,
  LinkTextButton,
  Separator,
  Stack,
  Text,
  Tooltip,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInDay } from "date-fns/constants"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import {
  borrowReservesQuery,
  gigaLendingPoolAddressProvider,
  useFacilitatorBucket,
} from "@/api/borrow"
import { useBorrowPoolDataContract } from "@/api/borrow/contracts"
import { useBlockTime } from "@/api/chain"
import { useGigaApr } from "@/api/gigaApr"
import { gigaStakeConstantsQuery, gigaTotalLockedQuery } from "@/api/gigaStake"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { STAKING_DOCS_LINK } from "@/config/links"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman, toDecimal } from "@/utils/formatting"

export const GigaStakeTotalsHeader: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { data: blockTimeMs = 0 } = useBlockTime()
  const poolDataContract = useBorrowPoolDataContract()
  const { data: constants, isLoading: isConstantsLoading } = useQuery(
    gigaStakeConstantsQuery(rpc),
  )
  const { isMobile, isTablet } = useBreakpoints()

  const { total, base, voting, isLoading: isAprLoading } = useGigaApr()

  const showAprBreakdown = !!base && !!voting
  const aprBreakdown = t("staking:dashboard.projectedAPR.summ", {
    base,
    voting,
  })

  const cooldownPeriodDays = Math.round(
    ((constants?.cooldownPeriod ?? 0) * blockTimeMs) / millisecondsInDay,
  )

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
  const {
    data: facilitatorBucketData,
    isLoading: isFacilitatorBucketLoading,
    isSuccess: isFacilitatorBucketSuccess,
  } = useFacilitatorBucket(hollarReserve?.aTokenAddress ?? "")

  const { data: gigaLockedHDX, isLoading: isGigaLockedHDXLoading } = useQuery(
    gigaTotalLockedQuery(rpc),
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

  const totalStakeStat = (
    <ValueStats
      wrap
      size="medium"
      label={t("staking:gigaStake.header.totalStake")}
      isLoading={isGigaLockedHDXLoading || isTotalGigaSuppliedUsdLoading}
      value={t("currency.compact", {
        value: totalGigaSupplied,
        symbol: native.symbol,
      })}
      bottomLabel={totalGigaSuppliedUsd}
    />
  )

  const projectedAprStat = (
    <Tooltip asChild={false} text={<ProjectedAPRTooltipContent />}>
      <ValueStats
        wrap
        size="medium"
        label={t("staking:dashboard.recentAPR")}
        isLoading={isAprLoading}
        customValue={
          <ValueStatsValue size="medium">
            {total ? t("percent", { value: total }) : "—"}
          </ValueStatsValue>
        }
        customBottomLabel={
          showAprBreakdown ? (
            <Text fs="p7" lh={1} color={getToken("accents.success.emphasis")}>
              {aprBreakdown}
            </Text>
          ) : undefined
        }
      />
    </Tooltip>
  )

  const minimumLockPeriodStat = (
    <ValueStats
      wrap
      size="medium"
      label={t("staking:gigaStake.header.minimumLockPeriod")}
      isLoading={isConstantsLoading}
      value={t("staking:gigaStake.header.valueDays", {
        value: cooldownPeriodDays,
      })}
    />
  )

  const availableToBorrowStat = (
    <ValueStats
      wrap
      size="medium"
      label={t("staking:gigaStake.header.availableToBorrow")}
      isLoading={isGigaPoolReservesLoading || isFacilitatorBucketLoading}
      value={
        isFacilitatorBucketSuccess
          ? t("currency", {
              value: availableToBorrow,
              symbol: hollarSymbol,
            })
          : "-"
      }
    />
  )

  if (isMobile || isTablet) {
    return (
      <Grid columnTemplate="1fr auto 1fr" gap="l" width="100%">
        {totalStakeStat}
        <Separator
          orientation="vertical"
          sx={{ alignSelf: "center", height: "60%" }}
        />
        {projectedAprStat}
        <Separator sx={{ gridColumn: "1 / -1" }} />
        {minimumLockPeriodStat}
        <Separator
          orientation="vertical"
          sx={{ alignSelf: "center", height: "60%" }}
        />
        {availableToBorrowStat}
      </Grid>
    )
  }

  return (
    <Stack
      direction={["column", null, "row"]}
      gap={["base", null, "xxxl", "3.75rem"]}
      separated
    >
      {totalStakeStat}
      {projectedAprStat}
      {minimumLockPeriodStat}
      {availableToBorrowStat}
    </Stack>
  )
}

export const ProjectedAPRTooltipContent = () => {
  const { t } = useTranslation("staking")
  const lines = t("dashboard.projectedAPR.gigaStaking.tooltip", {
    returnObjects: true,
  }) as Array<string>

  return (
    <Flex direction="column" gap="m">
      <Text fw={600} fs="p6" lh={1.4} color={getToken("text.high")}>
        {lines[0]}
      </Text>

      <Text fw={400} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Trans t={t} i18nKey="gigaStaking.projectedAPR.base.tooltip">
          <Text fw={600} as="span" />
        </Trans>
      </Text>

      <Text fw={400} fs="p6" lh={1.4} color={getToken("text.high")}>
        <Trans t={t} i18nKey="gigaStaking.projectedAPR.voting.tooltip">
          <Text fw={600} as="span" />
        </Trans>
      </Text>

      <Text fw={400} fs="p6" lh={1.4} color={getToken("text.medium")}>
        {lines[3]}
      </Text>

      <LinkTextButton href={STAKING_DOCS_LINK} direction="internal">
        {t("dashboard.projectedAPR.tooltip.docs")}
      </LinkTextButton>
    </Flex>
  )
}
