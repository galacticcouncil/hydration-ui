import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLogo } from "@/components/AssetLogo"
import {
  StrategyBadge,
  StrategyBadgeType,
} from "@/modules/strategies/components/StrategyBadge"

export type StrategyHeaderProps = {
  badges?: StrategyBadgeType[]
  logoId: string | string[]
  subtitle?: string
  title: string
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  badges = [],
  logoId,
  subtitle,
  title,
}) => (
  <Flex justify="space-between" align="center" gap="base" wrap>
    <Flex align="center" gap="base">
      <AssetLogo id={logoId} size="large" hideChain />
      <Flex direction="column">
        <Text
          font="primary"
          fs="h6"
          lh={1}
          fw={600}
          color={getToken("text.high")}
        >
          {title}
        </Text>
        {subtitle && (
          <Text fs="p5" color={getToken("text.medium")}>
            {subtitle}
          </Text>
        )}
      </Flex>
    </Flex>

    {badges.length > 0 && (
      <Flex align="center" gap="s" wrap>
        {badges.map((badge) => (
          <StrategyBadge key={badge} size="large" type={badge} />
        ))}
      </Flex>
    )}
  </Flex>
)
