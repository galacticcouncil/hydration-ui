import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import StakedBalance from "assets/icons/StakedBalanceIcon.svg?react"
import ProjectedRewardsIcon from "assets/icons/ProjectedRewardsIcon.svg?react"
import Skeleton from "react-loading-skeleton"
import { SStakingValuesContainer } from "./StakingValues.styled"
import { Trans, useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { TStakingData, useStakeARP } from "sections/staking/StakingPage.utils"
import { isApiLoaded } from "utils/helpers"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useRpcProvider } from "providers/rpcProvider"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

export const StakingValue = ({
  logo,
  title,
  value,
  tooltip,
  className,
}: {
  logo: JSX.Element
  title: string
  value: string | JSX.Element
  tooltip?: string | JSX.Element
  className?: string
}) => {
  return (
    <div
      sx={{
        flex: ["row", "column"],
        align: ["start", "center"],
        gap: 6,
        minWidth: 120,
      }}
      css={{ flex: "1 1 50%" }}
      className={className}
    >
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
          <Text fs={[19]} color="white">
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
  const { api } = useRpcProvider()

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
          <AprStatValue />
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
        {projectedRewards}
      </div>
    )

  return (
    <SStakingValuesContainer>
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
              <Text fs={[19]} lh={[19]} color="white">
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

      {projectedRewards}
    </SStakingValuesContainer>
  )
}

export const AprStatValue = () => {
  const { t } = useTranslation()
  const stakeApr = useStakeARP()

  return (
    <Text fs={[19]} color="white">
      {stakeApr.isLoading ? (
        <Skeleton width={100} height={24} />
      ) : (
        t("value.percentage", { value: stakeApr?.data?.apr })
      )}
    </Text>
  )
}
