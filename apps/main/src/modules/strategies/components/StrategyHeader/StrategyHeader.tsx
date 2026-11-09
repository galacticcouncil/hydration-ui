import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { type ReactNode } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import {
  StrategyBadge,
  StrategyBadgeType,
} from "@/modules/strategies/components/StrategyBadge"

export type StrategyHeaderProps = (
  | { logoId: string | string[]; logo?: never }
  | { logo: ReactNode; logoId?: never }
) & {
  badges?: StrategyBadgeType[]
  subtitle?: string
  title: string
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  badges = [],
  logoId,
  logo,
  subtitle,
  title,
}) => (
  <Flex justify="space-between" align="center" gap="base" wrap>
    <Flex align="center" gap="base">
      {logoId !== undefined ? (
        <AssetLogo id={logoId} size="large" hideChain />
      ) : (
        logo
      )}
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
