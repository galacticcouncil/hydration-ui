import { ClassNames } from "@emotion/react"
import { HydrationLogo } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly allocatedRewards: string
  readonly isLoading: boolean
}

export const RewardsInfoMobile: FC<Props> = ({
  allocatedRewards,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  const [allocatedRewardsDisplay] = useDisplayAssetPrice(
    native.id,
    allocatedRewards,
  )

  return (
    <Flex align="center" justify="space-between">
      <Flex align="center" gap={8}>
        <Icon component={HydrationLogo} size={18} />
        <Box>
          {(
            t("staking:dashboard.allocated.mobile", {
              returnObjects: true,
            }) as string[]
          ).map((line, i) => (
            <Text
              key={i}
              fs={13}
              fw={500}
              lh={px(15)}
              color={getToken("text.high")}
            >
              {line}
            </Text>
          ))}
        </Box>
      </Flex>
      <ClassNames>
        {({ css }) => (
          <ValueStats
            containerClassName={css`
              align-items: end;
            `}
            size="large"
            value={t("currency", {
              value: allocatedRewards,
              symbol: native.symbol,
            })}
            bottomLabel={allocatedRewardsDisplay}
            isLoading={isLoading}
          />
        )}
      </ClassNames>
    </Flex>
  )
}
