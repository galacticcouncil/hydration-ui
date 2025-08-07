import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"

export const PoolDetailsHeaderSkeleton = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Flex
      justify="space-between"
      sx={{
        pt: getTokenPx("containers.paddings.primary"),
        pb: getTokenPx("scales.paddings.m"),
      }}
    >
      <Flex>
        <Flex gap={8} align="center">
          <Logo id="0" isLoading size="large" />

          <Flex direction="column">
            <Flex gap={4} align="center">
              <Text font="primary" fw={700} fs={18} lh="130%">
                <Skeleton width={100} height="100%" />
              </Text>
              <Text fw={400} fs="p5" color={getToken("text.tint.secondary")}>
                {t("details.header.apr", { value: 20 })}
              </Text>
              <Logo id="10" size="small" />
            </Flex>
            <Text fw={600} fs={11} color={getToken("text.medium")}>
              <Skeleton width={40} height="100%" />
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        align="center"
        gap={getTokenPx("containers.paddings.tertiary")}
        sx={{
          position: ["fixed", "unset"],
          bottom: 72,
          zIndex: 2,
        }}
      >
        <Button disabled>
          <Icon size={14} component={Plus} />
          {t("details.header.addJoinFarms")}
        </Button>
        <Button variant="secondary" disabled>
          <Icon size={14} component={Plus} />
          {t("details.header.swap")}
        </Button>
      </Flex>
    </Flex>
  )
}
