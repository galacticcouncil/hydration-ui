import {
  Chip,
  ChipProps,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
  ValueStatsProps,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FileRouteTypes, Link } from "@tanstack/react-router"

import { AssetLogo } from "@/components/AssetLogo"
import { DecentralLogo } from "@/modules/strategies/hdcl/components/DecentralLogo"
import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"

type BadgeProps = {
  label: string
  variant: ChipProps["variant"]
}

export type StrategyCardProps = {
  logoId: string
  stats: ValueStatsProps[]
  badges?: BadgeProps[]
  title: string
  description: string
  link?: FileRouteTypes["to"]
  /** route params for `link` when it's a dynamic route (e.g. { asset }) */
  linkParams?: Record<string, string>
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  logoId,
  stats,
  title,
  description,
  link,
  linkParams,
  badges = [],
}) => {
  return (
    <Paper p="xl" hoverable position="relative">
      <Stack gap="l">
        <Flex
          justify="space-between"
          align="flex-start"
          sx={{ aspectRatio: ["4 / 1", null, null, null, "2 / 1"] }}
        >
          {logoId === "decentral" ? (
            <DecentralLogo size={56} />
          ) : logoId === "propeller" ? (
            <PropellerLogo size={56} />
          ) : (
            <AssetLogo id={logoId} size="extra-large" />
          )}
          {badges.length > 0 && (
            <Flex direction="column" gap="s" align="flex-end">
              {badges.map(({ label, variant }) => (
                <Chip key={label} variant={variant} rounded>
                  {label}
                </Chip>
              ))}
            </Flex>
          )}
        </Flex>

        <Flex gap="xl">
          {stats.map((stat) => (
            <ValueStats
              key={stat.label}
              customValue={
                <Text fs="h5" lh={1} font="primary" fw={600}>
                  {stat.value}
                </Text>
              }
              {...stat}
              size="large"
              wrap
            />
          ))}
        </Flex>

        <Separator my="s" />

        <Stack gap="base">
          <Text fw={500} lh={1.1} fs="h6" font="primary">
            {title}
          </Text>
          <Text fs="p4" color={getToken("text.low")}>
            {description}
          </Text>
        </Stack>
      </Stack>
      <Link
        to={link}
        params={linkParams as never}
        sx={{ "&::before": { content: "''", position: "absolute", inset: 0 } }}
      />
    </Paper>
  )
}
