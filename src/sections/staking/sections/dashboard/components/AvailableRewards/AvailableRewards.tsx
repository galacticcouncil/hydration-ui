import { Text } from "components/Typography/Text/Text"
import RewardIcon from "assets/icons/StakingRewardIcon.svg?react"
import LegendaCircle from "assets/icons/LegendaCircle.svg?react"
import {
  SRewardCardContainer,
  SRewartCardHeader,
} from "./AvailableRewards.styled"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Trans, useTranslation } from "react-i18next"
import { useDisplayPrice } from "utils/displayAsset"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import Skeleton from "react-loading-skeleton"
import { useClaimReward } from "sections/staking/StakingPage.utils"
import { ToastMessage, useStore } from "state/store"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { TOAST_MESSAGES } from "state/toasts"
import { theme } from "theme"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useProcessedVotesIds } from "api/staking"
import { BN_0 } from "utils/constants"
import { Graph } from "components/Graph/Graph"
import { XAxis, YAxis } from "recharts"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { useAssets } from "providers/assets"
import { useRefetchAccountAssets } from "api/deposits"

export const AvailableRewards = () => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { account } = useAccount()
  const reward = useClaimReward()
  const { native } = useAssets()
  const spotPrice = useDisplayPrice(native.id)
  const refetch = useRefetchAccountAssets()

  const processedVotes = useProcessedVotesIds()

  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  const isLoading = !reward.data || spotPrice.isLoading

  const onClaimRewards = async () => {
    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`staking.toasts.claim.${msType}`}
          tOptions={{
            value: reward.data?.rewards,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    const processedVoteIds = await processedVotes.mutateAsync()

    await createTransaction(
      {
        tx:
          processedVoteIds &&
          (processedVoteIds.newProcessedVotesIds.length ||
            processedVoteIds?.oldProcessedVotesIds.length)
            ? api.tx.utility.batchAll([
                ...processedVoteIds.oldProcessedVotesIds.map((id) =>
                  api.tx.democracy.removeVote(id),
                ),
                ...processedVoteIds.newProcessedVotesIds.map((id) =>
                  api.tx.convictionVoting.removeVote(null, id),
                ),
                api.tx.staking.claim(reward.data?.positionId!),
              ])
            : api.tx.staking.claim(reward.data?.positionId!),
      },
      { toast },
    )

    await queryClient.invalidateQueries(QUERY_KEYS.stake(account?.address))
    refetch()
  }

  const isGraphSecondaryPoint = reward.data?.chartValues?.some(
    (value) => value.currentSecondary,
  )

  return (
    <SRewardCardContainer>
      <SRewartCardHeader>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Icon sx={{ color: "pink600" }} icon={<RewardIcon />} />
          <Text color="white">{t("staking.dashboard.rewards.allocated")}</Text>
        </div>

        {isLoading || !reward.data ? (
          <Skeleton width={90} height={25} />
        ) : (
          <div sx={{ flex: "column", justify: "space-around" }}>
            <Text
              fs={20}
              color="white"
              tTransform="uppercase"
              css={{ whiteSpace: "nowrap" }}
            >
              {t("value.tokenWithSymbol", {
                value: reward.data.maxRewards ?? BN_0,
                symbol: "HDX",
                decimalPlaces: 2,
              })}
            </Text>
            <Text
              fs={14}
              css={{ color: "rgba(255, 255, 255, 0.6)" }}
              tAlign="right"
            >
              <DisplayValue
                value={
                  reward.data.maxRewards?.multipliedBy(
                    spotPrice.data?.spotPrice ?? 1,
                  ) ?? BN_0
                }
              />
            </Text>
          </div>
        )}
      </SRewartCardHeader>

      <div sx={{ pt: 28, flex: "column", gap: 20 }}>
        <div
          sx={{
            flex: ["column", "row"],
            px: 25,
            gap: [24, 40],
          }}
        >
          <div
            sx={{
              flex: "column",
              justify: "center",
              gap: 24,
            }}
          >
            <Text color="white">
              {t("staking.dashboard.rewards.available")}
            </Text>
            <div sx={{ flex: "column", justify: "space-around" }}>
              {isLoading || !reward.data ? (
                <Skeleton width={90} height={25} />
              ) : (
                <Text
                  fs={24}
                  color="white"
                  tTransform="uppercase"
                  css={{ whiteSpace: "nowrap" }}
                >
                  {t("value.tokenWithSymbol", {
                    value: reward.data.rewards,
                    symbol: "HDX",
                    decimalPlaces: 2,
                  })}
                </Text>
              )}
              {isLoading || !reward.data ? (
                <Skeleton width={60} height={16} />
              ) : (
                <Text fs={14} css={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  <DisplayValue
                    value={reward.data.rewards.multipliedBy(
                      spotPrice.data?.spotPrice ?? 1,
                    )}
                  />
                </Text>
              )}
            </div>

            <div sx={{ flex: "column" }}>
              {isLoading || !reward.data ? (
                <Skeleton width={90} height={25} />
              ) : (
                <Text
                  fs={24}
                  color="white"
                  tTransform="uppercase"
                  css={{ whiteSpace: "nowrap" }}
                >
                  {t("value.percentage", {
                    value: reward.data.allocatedRewardsPercentage,
                  })}
                </Text>
              )}
              <Text fs={14} color="white" css={{ opacity: 0.6 }}>
                {t("staking.dashboard.rewards.allocatedRewards")}
              </Text>
            </div>
          </div>
          <div
            sx={{
              flexGrow: 2,
              minWidth: 300,
              height: 200,
              flex: "column",
              gap: 20,
            }}
          >
            {reward.data?.chartValues && (
              <RewardsGraph data={reward.data.chartValues} />
            )}
            {isGraphSecondaryPoint && (
              <div sx={{ flex: "row", gap: 20, justify: "center" }}>
                <div sx={{ flex: "row", gap: 4, align: "center" }}>
                  <Icon sx={{ color: "white" }} icon={<LegendaCircle />} />
                  <Text fs={12} color="white" sx={{ opacity: 0.6 }}>
                    {t("staking.dashboard.rewards.legend.current")}
                  </Text>
                </div>

                <div sx={{ flex: "row", gap: 4, align: "center" }}>
                  <Icon
                    sx={{ color: "warningYellow300" }}
                    icon={<LegendaCircle />}
                  />
                  <Text fs={12} color="white" sx={{ opacity: 0.6 }}>
                    {t("staking.dashboard.rewards.legend.future")}
                  </Text>
                  <InfoTooltip
                    text={t("staking.dashboard.rewards.legend.tooltip")}
                  >
                    <SInfoIcon />
                  </InfoTooltip>
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            gap: 20,
            p: 25,
          }}
          css={{ background: "rgba(51, 22, 42, 0.50)" }}
        >
          <Text color="warningYellow200" lh={22} sx={{ maxWidth: 380 }}>
            {t("staking.dashboard.rewards.desc", {
              value: reward.data?.maxRewards?.minus(reward.data.rewards),
            })}
          </Text>
          <Button
            size="small"
            variant="primary"
            disabled={
              !reward.data ||
              reward.data.rewards.isZero() ||
              account?.isExternalWalletConnected
            }
            onClick={onClaimRewards}
            sx={{ width: 130 }}
          >
            {t("staking.dashboard.rewards.button")}
          </Button>
        </div>
      </div>
    </SRewardCardContainer>
  )
}

const RewardsGraph = ({
  data,
}: {
  data: {
    x: number
    y: number
    current: boolean
  }[]
}) => {
  const { t } = useTranslation()

  const tickProps = {
    stroke: theme.colors.white,
    fontSize: 8,
    fontWeight: 100,
    strokeWidth: 0.5,
    letterSpacing: 0.5,
    fill: theme.colors.white,
  }

  const labelProps = {
    offset: 0,
    fill: theme.colors.white,
    fontSize: 10,
    letterSpacing: 0.5,
  }

  return (
    <Graph
      withoutReferencedLine
      offset={{ top: 0, right: 0, left: -25, bottom: -20 }}
      labelX={
        <XAxis
          padding={{ left: 0, right: 10 }}
          axisLine={false}
          tickLine={false}
          tick={({ payload, index, visibleTicksCount, x, y }) => {
            if (index === visibleTicksCount - 1) {
              return (
                <text x={x - 20} y={y} {...labelProps} fontSize={11}>
                  {t("staking.dashboard.graph.axisX")}
                </text>
              )
            }
            return (
              <text x={x - 10} y={y} {...labelProps}>
                {payload.value}
              </text>
            )
          }}
          type="number"
          tickCount={10}
          domain={[0, "auto"]}
          interval={0}
          dataKey="x"
        />
      }
      labelY={
        <YAxis
          padding={{ top: 16, bottom: 16 }}
          axisLine={false}
          tickLine={false}
          name={t("staking.dashboard.graph.axisY")}
          tick={tickProps}
          tickFormatter={(value) =>
            value === 0 || value === 100 ? `${value}%` : ""
          }
          type="number"
          dataKey="y"
          label={{
            value: t("staking.dashboard.graph.axisY"),
            position: "insideLeft",
            angle: -90,
            dy: 50,
            dx: 45,
            ...labelProps,
          }}
        />
      }
      data={data}
    />
  )
}
