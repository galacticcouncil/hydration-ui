import { SContainer } from "sections/staking/StakingPage.styled"
import {
  AprStatValue,
  StakingValue,
  StakingValues,
} from "./Values/StakingValues"
import { PieChart } from "sections/staking/sections/dashboard/components/PieChart/PieChart"
import { useAccountStore } from "state/store"
import { TStakingData } from "sections/staking/StakingPage.utils"
import { Icon } from "components/Icon/Icon"
import ProjectedRewardsIcon from "assets/icons/ProjectedRewardsIcon.svg?react"
import Skeleton from "react-loading-skeleton"
import { Trans, useTranslation } from "react-i18next"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"

export const Stats = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: TStakingData
}) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()

  return (
    <SContainer sx={{ p: [24, 40] }}>
      <div
        sx={{
          flex: "column",
          justify: "space-between",
          gap: 40,
        }}
      >
        <div
          sx={{ flex: "column", align: "center" }}
          css={{ alignSelf: "center" }}
        >
          <PieChart
            percentage={data?.supplyStaked?.toNumber() ?? 0}
            circulatigSupply={data?.circulatingSupply.toNumber() ?? 0}
            loading={!!loading}
          />
          {!account?.address && !loading && (
            <>
              <Spacer size={32} />
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
                    <Trans t={t} i18nKey="staking.dashboard.stats.apr.tooltip">
                      <div />
                    </Trans>
                  </Text>
                }
                value={
                  loading ? (
                    <div sx={{ flex: "column", gap: 2 }}>
                      <Skeleton width={100} height={24} />
                    </div>
                  ) : (
                    <AprStatValue availableBalance={data?.availableBalance} />
                  )
                }
              />
            </>
          )}
        </div>

        {account && data && (
          <StakingValues
            loading={!!loading}
            data={data}
            isStakingPosition={!!data?.stakePosition}
          />
        )}
      </div>
    </SContainer>
  )
}
