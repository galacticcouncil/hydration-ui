import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
export const PoolDetailsHeader = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const isOmnipool = !isIsolatedPool(data)
  const { t } = useTranslation("liquidity")

  const navigate = useNavigate()

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
          <Logo id={isOmnipool ? data.id : data.meta.iconId} size="large" />

          <Flex direction="column">
            <Flex gap={4} align="center">
              <Text font="primary" fw={700} fs={18} lh="130%">
                {data.meta.name}
              </Text>
              <Text fw={400} fs="p5" color={getToken("text.tint.secondary")}>
                {t("details.header.apr", { value: 20 })}
              </Text>
              <Logo id="10" size="small" />
            </Flex>
            <Text fw={600} fs={11} color={getToken("text.medium")}>
              {data.meta.symbol}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex align="center" gap={getTokenPx("containers.paddings.tertiary")}>
        <Button
          onClick={() =>
            navigate({
              to: "/liquidity/$id/add",
              params: { id: data.id },
              resetScroll: false,
            })
          }
        >
          <Icon size={14} component={Plus} />
          {t("details.header.addJoinFarms")}
        </Button>
        <Button outline>
          <Icon size={14} component={Plus} />
          {t("details.header.swap")}
        </Button>
      </Flex>
    </Flex>
  )
}
