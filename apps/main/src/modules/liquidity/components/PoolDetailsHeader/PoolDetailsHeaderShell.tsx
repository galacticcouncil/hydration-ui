import { Flex, Text } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

import { AssetLogo } from "@/components/AssetLogo"

import { SPoolDetailsActionsContainer } from "./PoolDetailsHeader.styled"

export type PoolDetailsHeaderShellProps = {
  logoId: string | string[]
  title: ReactNode
  subtitle?: ReactNode
  badges?: ReactNode
  actions: ReactNode
}

export const PoolDetailsHeaderShell = ({
  logoId,
  title,
  subtitle,
  badges,
  actions,
}: PoolDetailsHeaderShellProps) => (
  <Flex justify="space-between" pb="m">
    <Flex gap="base" align="flex-start" wrap>
      <AssetLogo id={logoId} size="large" />

      <Flex direction="column">
        <Text font="primary" fw={700} fs="p1" lh="130%">
          {title}
        </Text>
        {subtitle}
      </Flex>

      {badges}
    </Flex>

    <SPoolDetailsActionsContainer align="center" gap="m">
      {actions}
    </SPoolDetailsActionsContainer>
  </Flex>
)
