import {
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FileRouteTypes, Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { DecentralLogo } from "@/modules/strategies/hdcl/components/DecentralLogo"

export type StrategyCardProps = {
  logoId: string
  apy: number
  liquidity?: string
  title: string
  description: string
  link?: FileRouteTypes["to"]
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  logoId,
  apy,
  liquidity,
  title,
  description,
  link,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <Paper p="xl" hoverable position="relative">
      <Stack gap="l">
        <Flex
          justify="space-between"
          align="flex-start"
          sx={{ aspectRatio: ["3 / 1", "2 / 1"] }}
        >
          {logoId === "decentral" ? (
            <DecentralLogo size={56} />
          ) : (
            <AssetLogo id={logoId} size="extra-large" />
          )}
        </Flex>

        <Flex gap="xl">
          <ValueStats
            label={t("apy")}
            customValue={
              <Text
                fs="h5"
                lh={1}
                font="primary"
                fw={600}
                color={getToken("accents.success.emphasis")}
              >
                {t("common:percent", { value: apy })}
              </Text>
            }
            size="medium"
            wrap
          />
          {liquidity && (
            <ValueStats
              label={t("liquidity")}
              customValue={
                <Text fs="h5" lh={1} font="primary" fw={600}>
                  {liquidity}
                </Text>
              }
              size="medium"
              wrap
            />
          )}
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
        sx={{ "&::before": { content: "''", position: "absolute", inset: 0 } }}
      />
    </Paper>
  )
}
