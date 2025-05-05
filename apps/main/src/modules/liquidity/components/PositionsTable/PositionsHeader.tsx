import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

import { ClaimCard } from "./ClaimCard"
import { PositionTableData } from "./PositionsTable"

type PositionsHeaderProps = {
  assetId: string
  data: PositionTableData[]
}

export const PositionsHeader = ({ assetId, data }: PositionsHeaderProps) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isTablet, isMobile } = useBreakpoints()
  const { hub, getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(assetId)

  const totals = useMemo(() => {
    return data.reduce(
      (acc, curr) => {
        return {
          value: Big(acc.value)
            .plus(curr.currentValueHuman ?? 0)
            .toString(),
          hubValue: Big(acc.hubValue)
            .plus(curr.currentHubValueHuman ?? 0)
            .toString(),
          valueDisplay: Big(acc.valueDisplay)
            .plus(curr.currentTotalDisplay ?? 0)
            .toString(),
        }
      },
      {
        value: "0",
        hubValue: "0",
        valueDisplay: "0",
      },
    )
  }, [data])

  return (
    <Flex
      justify="space-between"
      align="center"
      gap={24}
      sx={{
        px: getTokenPx("containers.paddings.primary"),
        py: getTokenPx("containers.paddings.secondary"),
        borderBottom: "1px solid",
        borderColor: getToken("details.separators"),
        position: "sticky",
        left: 0,
      }}
    >
      <Flex direction="column">
        <Text fs="p6" fw={400} color={getToken("text.medium")} sx={{ mb: 4 }}>
          {t("liquidity:liquidity.positions.header.locked")}
        </Text>
        <Text
          font="primary"
          fs="h7"
          lh={1}
          fw={700}
          color={getToken("text.high")}
        >
          {t("currency", { value: totals.value, symbol: meta.symbol })}
          {totals.hubValue !== "0" &&
            t("currency", {
              value: totals.hubValue,
              symbol: hub.symbol,
              prefix: " + ",
            })}
        </Text>
        <Text fs="p6" fw={400} lh={1} color={getToken("text.medium")}>
          {t("currency", { value: totals.valueDisplay })}
        </Text>
      </Flex>

      <Separator orientation="vertical" sx={{ height: 30 }} />

      <Flex direction="column">
        <Text fs="p6" fw={400} color={getToken("text.medium")} sx={{ mb: 4 }}>
          {t("liquidity:liquidity.positions.header.liquidityPositions")}
        </Text>
        <Text
          font="primary"
          fs="h7"
          fw={700}
          color={getToken("text.high")}
          lh={1}
        >
          {data.length}
        </Text>
      </Flex>

      {!isTablet && !isMobile && (
        <>
          <Separator orientation="vertical" sx={{ height: 30 }} />
          <ClaimCard />
        </>
      )}
    </Flex>
  )
}
