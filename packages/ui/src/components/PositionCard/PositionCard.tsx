import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { Paper } from "@/components/Paper"
import {
  SActionColumn,
  SNameColumn,
  SRowContainer,
  SValuesColumn,
} from "@/components/PositionCard/PositionCard.styled"
import { ResponsiveScope } from "@/components/ResponsiveScope"
import { Text } from "@/components/Text"

export type PositionCardProps = {
  logo: ReactNode
  symbol: ReactNode
  stats: ReactNode
  cta?: ReactNode
}

export const PositionCard: FC<PositionCardProps> = ({
  logo,
  symbol,
  stats,
  cta,
}) => {
  return (
    <ResponsiveScope>
      <Paper p="l" shadow={false} bg="dim" borderRadius="m">
        <SRowContainer gap="l">
          <SNameColumn align="center" gap="s">
            {logo}
            {typeof symbol === "string" ? (
              <Text fs="p3" fw={500} color={getToken("text.high")}>
                {symbol}
              </Text>
            ) : (
              symbol
            )}
          </SNameColumn>

          <SValuesColumn justify="space-between" gap="xxl">
            {stats}
          </SValuesColumn>

          <SActionColumn direction="column" align="flex-end" gap="xs">
            {cta}
          </SActionColumn>
        </SRowContainer>
      </Paper>
    </ResponsiveScope>
  )
}
