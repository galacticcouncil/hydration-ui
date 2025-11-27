import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { AssetYields } from "./AssetYields"

export const PoolDetailsHeader = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const { t } = useTranslation("liquidity")
  const isOmnipool = !isIsolatedPool(data)
  const stablepoolData = isOmnipool ? data.stablepoolData : undefined

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
            id={isOmnipool ? data.meta.id : data.meta.iconId}
            size="large"
          />

          <Flex direction="column">
            <Flex gap={4} align="center">
              <Text font="primary" fw={700} fs={18} lh="130%">
                {data.meta.name}
              </Text>
              {data.isFeeLoading ? (
                <Skeleton width={60} height="1em" />
              ) : (
                <AssetYields data={data} />
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
          <Link
            to={"/liquidity/$id/add"}
            params={{
              id: data.id,
            }}
            search={
              stablepoolData
                ? {
                    stableswapId: stablepoolData.id.toString(),
                    erc20Id: stablepoolData.aToken?.id.toString(),
                  }
                : undefined
            }
            resetScroll={false}
          >
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
