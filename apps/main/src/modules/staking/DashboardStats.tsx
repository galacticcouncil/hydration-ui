import { ProjectedAPR, StakedBalance } from "@galacticcouncil/ui/assets/icons"
import { Pie, PieChart, Skeleton } from "@galacticcouncil/ui/components"
import {
  Box,
  Flex,
  Icon,
  Separator,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import {
  useStakingAPR,
  useStakingSupply,
} from "@/modules/staking/DashboardStats.data"
import { SDashboardStats } from "@/modules/staking/DashboardStats.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly positionId: bigint
  readonly staked: string
  readonly isStakeLoading: boolean
}

export const DashboardStats: FC<Props> = ({
  positionId,
  staked,
  isStakeLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { themeProps } = useTheme()
  const { isMobile } = useBreakpoints()

  const { native } = useAssets()

  const {
    supplyStaked,
    circulatingSupply,
    isLoading: isSupplyLoading,
  } = useStakingSupply()

  const { stakingAPR, isLoading: APRLoading } = useStakingAPR(positionId)

  const [stakedBalanceDisplay] = useDisplayAssetPrice(native.id, staked)

  return (
    <SDashboardStats>
      {isSupplyLoading ? (
        <Skeleton height={130} width="90%" />
      ) : (
        <Flex
          py={7}
          gap={getTokenPx("containers.paddings.tertiary")}
          align="center"
        >
          <Flex
            height={115}
            width={115}
            p={12}
            bg={getToken("details.separatorsOnDim")}
            borderRadius="full"
            justify="center"
            align="center"
          >
            <PieChart height={90} width={90}>
              <Pie
                data={[{ value: 1 }]}
                innerRadius={15}
                outerRadius={45}
                startAngle={180}
                endAngle={180 - (360 * Number(supplyStaked)) / 100}
                stroke="none"
                fill={themeProps.controls.solid.activeHover}
              />
            </PieChart>
          </Flex>
          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quart")}
            maxWidth="min-content"
          >
            <Text
              fw={500}
              fs={10}
              lh={px(12)}
              color={getToken("text.high")}
              whiteSpace="nowrap"
            >
              {t("staking:dashboard.supplyStaked.title", {
                symbol: native.symbol,
              })}
            </Text>
            <Flex direction="column" gap={getTokenPx("scales.paddings.xs")}>
              <Text fw={500} fs={28} lh={px(30)} color={getToken("text.high")}>
                {t("percent", { value: supplyStaked })}
              </Text>
              <Text
                fw={400}
                fs={11}
                lh={px(15)}
                color={getToken("text.medium")}
              >
                <Trans
                  t={t}
                  i18nKey="staking:dashboard.supplyStaked.ofSupply"
                  values={{
                    amount: t("number", { value: circulatingSupply }),
                  }}
                >
                  <span sx={{ whiteSpace: "nowrap" }} />
                </Trans>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      )}
      <Flex direction="column" gap={getTokenPx("containers.paddings.tertiary")}>
        {isMobile && <Separator />}
        <Flex gap={9} align="center">
          <Icon component={ProjectedAPR} size={50} />
          <Flex direction="column" gap={3}>
            <Flex gap={4} align="center">
              <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
                {t("staking:dashboard.projectedAPR")}
              </Text>
              <Tooltip
                text={(
                  t("staking:dashboard.projectedAPR.tooltip", {
                    returnObjects: true,
                  }) as Array<string>
                ).map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              />
            </Flex>
            {APRLoading ? (
              <Skeleton height={18} />
            ) : (
              <Text fw={500} fs="h7" lh={1} color={getToken("text.high")}>
                {t("percent", { value: stakingAPR })}
              </Text>
            )}
          </Flex>
        </Flex>
        {!!positionId && (
          <>
            <Separator />
            <Flex gap={10} align="center">
              <Icon component={StakedBalance} size={50} />
              <Flex direction="column" gap={10}>
                <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
                  {t("staking:dashboard.balance")}
                </Text>
                <Box>
                  {isStakeLoading ? (
                    <Skeleton height={18} />
                  ) : (
                    <Text
                      fw={500}
                      fs={17.5}
                      lh={1}
                      color={getToken("text.high")}
                    >
                      {t("currency", {
                        value: staked,
                        symbol: native.symbol,
                      })}
                    </Text>
                  )}
                  {isStakeLoading ? (
                    <Skeleton height={12} />
                  ) : (
                    <Text fs={12} lh={1} color={getToken("text.medium")}>
                      ≈{stakedBalanceDisplay}
                    </Text>
                  )}
                </Box>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </SDashboardStats>
  )
}
