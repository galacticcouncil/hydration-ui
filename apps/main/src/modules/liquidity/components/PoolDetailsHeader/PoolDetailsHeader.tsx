import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import Big from "big.js"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
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
          <AssetLogo
            id={isOmnipool ? data.id : data.meta.iconId}
            size="large"
          />

          <Flex direction="column">
            <Flex gap={4} align="center">
              <Text font="primary" fw={700} fs={18} lh="130%">
                {data.meta.name}
              </Text>
              {data.isFarms && (
                <>
                  <Text
                    fw={400}
                    fs="p5"
                    color={getToken("text.tint.secondary")}
                  >
                    {data.isFeeLoading ? (
                      <Skeleton width={60} height="1em" />
                    ) : (
                      t("details.header.apr", {
                        value: data.farms.reduce(
                          (acc, farm) => acc.plus(farm.apr),
                          Big(0),
                        ),
                      })
                    )}
                  </Text>
                  <AssetLogo
                    id={data.farms.map((farm) =>
                      farm.rewardCurrency.toString(),
                    )}
                    size="small"
                  />
                </>
              )}
            </Flex>
            <Text fw={600} fs={11} color={getToken("text.medium")}>
              {data.meta.symbol}
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
        <Button asChild>
          <Link from="/liquidity/$id" to="add" resetScroll={false}>
            <Icon size={14} component={Plus} />
            {data.isFarms
              ? t("details.header.addJoinFarms")
              : t("addLiquidity")}
          </Link>
        </Button>
        <Button variant="secondary">
          <Icon size={14} component={Plus} />
          {t("details.header.swap")}
        </Button>
      </Flex>
    </Flex>
  )
}
