import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactComponent as AvailableBalance } from "assets/icons/HydraLogo.svg"
import { ReactComponent as StakedBalance } from "assets/icons/StakedBalanceIcon.svg"
import { ReactComponent as StakedMultiplier } from "assets/icons/StakedMultiplier.svg"
import { ReactComponent as ProjectedRewardsIcon } from "assets/icons/ProjectedRewardsIcon.svg"
import Skeleton from "react-loading-skeleton"
import { Separator } from "components/Separator/Separator"
import { SStakingValuesContainer } from "./StakingValues.styled"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Trans, useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { TStakingData, useStakeARP } from "sections/staking/StakingPage.utils"
import BN from "bignumber.js"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"

export const StakingValue = ({
  logo,
  title,
  value,
  tooltip,
}: {
  logo: JSX.Element
  title: string
  value: string | JSX.Element
  tooltip?: string | JSX.Element
}) => {
  return (
    <div sx={{ flex: ["row", "column"], align: ["start", "center"], gap: 6 }}>
      {logo}

      <div
        sx={{
          flex: "column",
          mt: [4, 0],
          align: ["start", "center"],
          gap: 8,
        }}
      >
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Text fs={[14, 16]} color="brightBlue300">
            {title}
          </Text>
          {tooltip && (
            <InfoTooltip text={tooltip}>
              <SInfoIcon />
            </InfoTooltip>
          )}
        </div>
        {typeof value === "string" ? (
          <Text fs={[19]} color="white" font="FontOver">
            {value}
          </Text>
        ) : (
          value
        )}
      </div>
    </div>
  )
}

export const StakingValues = ({
  loading,
  data,
  isStakingPosition,
}: {
  loading: boolean
  data: TStakingData
  isStakingPosition: boolean
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const api = useApiPromise()
  const isDelegatingVote = data.isDelegatingVote

  const availableBalanceValue = (
    <StakingValue
      logo={
        <Icon
          size={24}
          sx={{ color: "brightBlue300" }}
          icon={<AvailableBalance />}
        />
      }
      title={t("staking.dashboard.stats.available")}
      value={
        loading ? (
          <div sx={{ flex: "column", gap: 2 }}>
            <Skeleton width={100} height={24} />
            <Skeleton width={100} height={14} />
          </div>
        ) : (
          <div sx={{ flex: "column", align: ["start", "center"] }}>
            <Text fs={[19]} lh={[19]} color="white" font="FontOver">
              {t("value.tokenWithSymbol", {
                value: data?.availableBalance,
                symbol: "HDX",
                fixedPointScale: 12,
              })}
            </Text>
            <Text fs={14} color="darkBlue200">
              <DisplayValue value={data?.availableBalanceDollar} />
            </Text>
          </div>
        )
      }
    />
  )

  const projectedRewards = (
    <StakingValue
      logo={
        <Icon
          size={24}
          sx={{ color: "brightBlue300" }}
          icon={<ProjectedRewardsIcon />}
        />
      }
      title={t("staking.dashboard.stats.projectedRewards")}
      tooltip={
        <Text fs={11} fw={500}>
          <Trans
            t={t}
            i18nKey={`staking.dashboard.stats.${
              isStakingPosition ? "aprWithPos" : "apr"
            }.tooltip`}
          >
            <div />
          </Trans>
        </Text>
      }
      value={
        loading || !isApiLoaded(api) ? (
          <div sx={{ flex: "column", gap: 2 }}>
            <Skeleton width={100} height={24} />
          </div>
        ) : (
          <AprStatValue availableBalance={data?.availableBalance} />
        )
      }
    />
  )

  if (!isStakingPosition)
    return (
      <div
        sx={{ flex: ["column", "row"], justify: "space-between" }}
        css={{ rowGap: 28 }}
      >
        {availableBalanceValue}
        <Separator
          orientation={isDesktop ? "vertical" : "horizontal"}
          sx={{ height: [1, 35], m: "auto" }}
        />
        {projectedRewards}
      </div>
    )

  return (
    <SStakingValuesContainer>
      {availableBalanceValue}
      <Separator
        orientation={isDesktop ? "vertical" : "horizontal"}
        sx={{ height: [1, 35], m: "auto" }}
      />
      <StakingValue
        logo={
          <Icon
            size={20}
            sx={{ color: "brightBlue300", m: 3 }}
            icon={<StakedBalance />}
          />
        }
        title={t("staking.dashboard.stats.staked")}
        value={
          loading ? (
            <div sx={{ flex: "column", gap: 2 }}>
              <Skeleton width={100} height={24} />
              <Skeleton width={100} height={14} />
            </div>
          ) : (
            <div sx={{ flex: "column", align: ["start", "center"] }}>
              <Text fs={[19]} lh={[19]} color="white" font="FontOver">
                {t("value.tokenWithSymbol", {
                  value: data?.stakePosition?.stake,
                  symbol: "HDX",
                  fixedPointScale: 12,
                })}
              </Text>
              <Text fs={14} color="darkBlue200">
                <DisplayValue value={data?.stakeDollar} />
              </Text>
            </div>
          )
        }
      />

      <Separator
        orientation="horizontal"
        sx={{ height: 1, m: "auto", display: ["inherit", "none"] }}
      />

      {!isDelegatingVote && (
        <>
          <StakingValue
            logo={
              <Icon
                size={18}
                sx={{ color: "brightBlue300", m: 3 }}
                icon={<StakedMultiplier />}
              />
            }
            tooltip={t("staking.dashboard.stats.rewardBoost.tooltip")}
            title={t("staking.dashboard.stats.rewardBoost")}
            value={
              loading ? (
                <div sx={{ flex: "column", gap: 2 }}>
                  <Skeleton width={100} height={24} />
                </div>
              ) : (
                t("value.percentage", {
                  value: data?.stakePosition?.rewardBoostPersentage,
                })
              )
            }
          />
          <Separator
            orientation={isDesktop ? "vertical" : "horizontal"}
            sx={{ height: [1, 35], m: "auto" }}
          />
        </>
      )}
      {projectedRewards}
    </SStakingValuesContainer>
  )
}

export const AprStatValue = ({
  availableBalance,
}: {
  availableBalance: BN | undefined
}) => {
  const { t } = useTranslation()
  const stakeApr = useStakeARP(availableBalance)

  return (
    <Text fs={[19]} color="white" font="FontOver">
      {stakeApr.isLoading ? (
        <Skeleton width={100} height={24} />
      ) : (
        t("value.percentage", { value: stakeApr?.data?.apr })
      )}
    </Text>
  )
}
