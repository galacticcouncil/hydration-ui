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
import { useTranslation } from "react-i18next"
import { TStakingData } from "api/staking"
import { DisplayValue } from "components/DisplayValue/DisplayValue"

const StakingValue = ({
  logo,
  title,
  value,
}: {
  logo: JSX.Element
  title: string
  value: string | JSX.Element
}) => {
  return (
    <div sx={{ flex: ["row", "column"], align: ["start", "center"], gap: 6 }}>
      {logo}
      <div
        sx={{ flex: "column", mt: [4, 0], align: ["start", "center"], gap: 8 }}
      >
        <Text fs={[14, 16]} color="brightBlue300">
          {title}
        </Text>
        {typeof value === "string" ? (
          <Text fs={[19, 24]} color="white" font="FontOver">
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
            <Text fs={[19, 24]} lh={[19, 24]} color="white" font="FontOver">
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
      title={t("staking.dashboard.stats.projectdRewards")}
      value={
        loading ? (
          <div sx={{ flex: "column", gap: 2 }}>
            <Skeleton width={100} height={24} />
          </div>
        ) : (
          "5%"
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
            sx={{ color: "brightBlue300" }}
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
              <Text fs={[19, 24]} lh={[19, 24]} color="white" font="FontOver">
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

      <StakingValue
        logo={
          <Icon
            size={18}
            sx={{ color: "brightBlue300" }}
            icon={<StakedMultiplier />}
          />
        }
        title={t("staking.dashboard.stats.actionPoints")}
        value={
          loading ? (
            <div sx={{ flex: "column", gap: 2 }}>
              <Skeleton width={100} height={24} />
            </div>
          ) : (
            t("value", { value: data?.stakePosition?.actionPoints })
          )
        }
      />
      <Separator
        orientation={isDesktop ? "vertical" : "horizontal"}
        sx={{ height: [1, 35], m: "auto" }}
      />
      {projectedRewards}
    </SStakingValuesContainer>
  )
}
