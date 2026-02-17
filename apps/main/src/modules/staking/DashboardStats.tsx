import ProjectedAPR from "@galacticcouncil/ui/assets/images/ProjectedAPR.webp"
import StakedBalance from "@galacticcouncil/ui/assets/images/StakedBalance.webp"
import {
  Box,
  Flex,
  Image,
  Pie,
  PieChart,
  Separator,
  Skeleton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
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
    supplyStakedPercent,
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
        <Flex py="base" gap="m" align="center">
          <Flex
            height={115}
            width={115}
            p="m"
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
                cornerRadius={5}
                startAngle={PIE_START_ANGLE}
                endAngle={
                  PIE_START_ANGLE - (360 * Number(supplyStakedPercent)) / 100
                }
                stroke="none"
                fill={themeProps.controls.solid.activeHover}
              />
            </PieChart>
          </Flex>
          <Flex direction="column" gap="m" maxWidth="min-content">
            <Text
              fw={500}
              fs="p6"
              lh="xs"
              color={getToken("text.high")}
              whiteSpace="nowrap"
            >
              {t("staking:dashboard.supplyStaked.title", {
                symbol: native.symbol,
              })}
            </Text>
            <Flex direction="column" gap="base">
              <Flex direction="column">
                <Text
                  font="primary"
                  fw={500}
                  fs="h5"
                  lh={0.9}
                  color={getToken("text.high")}
                >
                  {t("percent", { value: supplyStakedPercent })}
                </Text>
                <Text fw={500} fs="p6" lh={1.2} color={getToken("text.high")}>
                  {t("currency", {
                    value: supplyStaked,
                    symbol: native.symbol,
                  })}
                </Text>
              </Flex>
              <Text fs="p6" lh="xs" color={getToken("text.medium")}>
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
      <Flex direction="column" gap="m">
        {isMobile && <Separator />}
        <Flex gap="base" align="center">
          <Image src={ProjectedAPR} width={50} height={50} />
          <Flex direction="column" gap="xs">
            <Flex gap="s" align="center">
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
              <Text
                font="primary"
                fw={500}
                fs="h7"
                lh={1}
                color={getToken("text.high")}
              >
                {t("percent", { value: stakingAPR })}
              </Text>
            )}
          </Flex>
        </Flex>
        {!!positionId && (
          <>
            <Separator />
            <Flex gap="base" align="center">
              <Image src={StakedBalance} width={50} height={50} />
              <Flex direction="column" gap="base">
                <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
                  {t("staking:dashboard.balance")}
                </Text>
                <Box>
                  {isStakeLoading ? (
                    <Skeleton height={18} />
                  ) : (
                    <Text
                      font="primary"
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
                    <Text fs="p5" lh={1} color={getToken("text.medium")}>
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

const PIE_START_ANGLE = 90
