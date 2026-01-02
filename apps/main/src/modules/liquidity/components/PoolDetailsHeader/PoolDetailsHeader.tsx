import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { Plus, Repeat } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { SPoolDetailsActionsContainer } from "@/modules/liquidity/components/PoolDetailsHeader/PoolDetailsHeader.styled"
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
  const isNative = isOmnipool ? data.isNative : false
  const stablepoolData = isOmnipool ? data.stablepoolData : undefined
  const { isMobile } = useBreakpoints()

  return (
    <Flex
      justify="space-between"
      sx={{
        pt: getTokenPx("containers.paddings.primary"),
        pb: getTokenPx("scales.paddings.m"),
      }}
    >
      <Flex gap={8} align="flex-start" wrap>
        <AssetLogo
          id={isOmnipool ? data.meta.id : data.meta.iconId}
          size="large"
        />

        <Flex direction="column">
          <Text font="primary" fw={700} fs={18} lh="130%">
            {data.meta.name}
          </Text>

          <Text fw={600} fs={11} color={getToken("text.medium")}>
            {data.meta.symbol}
          </Text>
        </Flex>

        {data.isFeeLoading ? (
          <Skeleton width={60} height="1em" />
        ) : (
          <AssetYields data={data} />
        )}
      </Flex>

      <SPoolDetailsActionsContainer
        align="center"
        gap={getTokenPx("containers.paddings.tertiary")}
      >
        <Button
          size={isMobile ? "medium" : "small"}
          width="100%"
          asChild
          disabled={!data.canAddLiquidity || isNative}
        >
          <Link
            to="/liquidity/$id/add"
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
            {t("addLiquidity")}
          </Link>
        </Button>
        {isOmnipool && (
          <Button
            variant="secondary"
            size={isMobile ? "medium" : "small"}
            width="100%"
            asChild
          >
            <Link
              to="/trade/swap/market"
              search={{
                assetOut: stablepoolData
                  ? stablepoolData.aToken?.id || data.id
                  : data.id,
              }}
            >
              <Icon size={14} component={Repeat} />
              {t("details.header.swap")}
            </Link>
          </Button>
        )}
      </SPoolDetailsActionsContainer>
    </Flex>
  )
}
