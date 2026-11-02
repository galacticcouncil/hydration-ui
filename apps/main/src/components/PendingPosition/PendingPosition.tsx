import {
  Amount,
  Flex,
  ResponsiveScope,
  Text,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SActionSection,
  SActionsGroup,
  SAmountSection,
  SMobileSeparator,
  SPendingPosition,
  SStat,
  SStatusSection,
} from "@/components/PendingPosition/PendingPosition.styled"

export type PendingPositionStat = {
  label: string
  value: ReactNode
  tooltip?: string
}

type PendingPositionProps = {
  assetId: string
  value: string
  displayValue?: string
  isLoading?: boolean
  stats?: PendingPositionStat[]
  status?: ReactNode
  action?: ReactNode
}

export const PendingPosition: FC<PendingPositionProps> = ({
  assetId,
  value,
  displayValue,
  isLoading,
  stats,
  status,
  action,
}) => (
  <ResponsiveScope>
    <SPendingPosition>
      <SAmountSection>
        <AssetLogo id={assetId} />
        <Amount
          value={value}
          displayValue={displayValue}
          isLoading={isLoading}
        />
      </SAmountSection>
      <SMobileSeparator />
      <SActionsGroup>
        <SStatusSection>
          {stats?.map((stat) => (
            <SStat key={stat.label}>
              <ValueStats
                label={stat.label}
                customValue={
                  <Flex align="center" gap="s">
                    <Text
                      as="div"
                      fs="p5"
                      lh={1}
                      fw={500}
                      color={getToken("text.high")}
                    >
                      {stat.value}
                    </Text>
                    {stat.tooltip && <Tooltip asChild text={stat.tooltip} />}
                  </Flex>
                }
                wrap={false}
                size="small"
                sx={{ alignItems: "flex-end" }}
              />
            </SStat>
          ))}
          {status}
        </SStatusSection>
        {action && <SActionSection>{action}</SActionSection>}
      </SActionsGroup>
    </SPendingPosition>
  </ResponsiveScope>
)
