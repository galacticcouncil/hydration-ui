import {
  Button,
  Flex,
  Icon,
  LogoSkeleton,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

export const PoolDetailsHeaderSkeleton = () => {
  const { t } = useTranslation("liquidity")

  return (
    <Flex justify="space-between" pb="m">
      <Flex gap="base">
        <LogoSkeleton size="large" />
        <Flex direction="column">
          <Flex gap="s" align="center">
            <Text font="primary" fw={700} fs="p1" lh="130%">
              <Skeleton width={100} height="100%" />
            </Text>
          </Flex>
          <Text fw={600} fs="p6" color={getToken("text.medium")}>
            <Skeleton width={40} height="100%" />
          </Text>
        </Flex>
      </Flex>
      <Flex
        align="center"
        gap="m"
        sx={{
          position: ["fixed", "unset"],
          bottom: "4.5rem",
          zIndex: 2,
        }}
      >
        <Button disabled>
          <Icon size="s" component={Plus} />
          {t("addLiquidity")}
        </Button>
        <Button variant="secondary" disabled>
          <Icon size="s" component={Plus} />
          {t("details.header.swap")}
        </Button>
      </Flex>
    </Flex>
  )
}
