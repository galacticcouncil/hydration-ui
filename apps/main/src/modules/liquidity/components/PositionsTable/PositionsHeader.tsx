import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleTrigger,
  Flex,
  Icon,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

import { ClaimCard } from "./ClaimCard"

type PositionsHeaderProps = {
  onClick: () => void
  showMore: boolean
  symbol: string
  totalBalance: string
  totalHubBalance?: string
  totalInFarms: string
  totalBalanceDisplay: string
}

export const PositionsHeader = ({
  onClick,
  showMore,
  symbol,
  totalBalance,
  totalHubBalance,
  totalInFarms,
  totalBalanceDisplay,
}: PositionsHeaderProps) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { hub } = useAssets()
  const { isTablet, isMobile } = useBreakpoints()

  return (
    <Flex direction="column" sx={{ position: "sticky", left: 0 }}>
      <CollapsibleTrigger onClick={onClick} sx={{ cursor: "pointer" }}>
        <Flex
          align="center"
          justify="space-between"
          sx={{
            px: getTokenPx("containers.paddings.primary"),
            py: getTokenPx("containers.paddings.secondary"),
            borderBottom: "1px solid",
            borderColor: getToken("details.separators"),
          }}
        >
          <Text fs="p3" fw={500} font="primary" color={getToken("text.high")}>
            {t("myPositions")}
          </Text>

          <Flex align="center" gap={getTokenPx("scales.paddings.s")}>
            <Text fs="p5" fw={500} color={getToken("text.low")}>
              {showMore ? t("showLess") : t("showMore")}
            </Text>
            <Icon
              component={ChevronDown}
              size={18}
              color={getToken("text.low")}
              sx={{
                transition: getToken("transitions.transform"),
                transform: showMore ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Flex>
        </Flex>
      </CollapsibleTrigger>
      <Flex
        justify="space-between"
        align="center"
        gap={24}
        sx={{
          px: getTokenPx("containers.paddings.primary"),
          py: getTokenPx("containers.paddings.secondary"),
          borderBottom: showMore ? "1px solid" : "none",
          borderColor: getToken("details.separators"),
        }}
      >
        <ValueStats
          label={t("liquidity:liquidity.positions.header.locked")}
          customValue={
            <Text
              font="primary"
              fs="h7"
              lh={1}
              fw={700}
              color={getToken("text.high")}
            >
              {t("currency", { value: totalBalance, symbol })}
              {totalHubBalance &&
                Big(totalHubBalance).gt(0) &&
                t("currency", {
                  value: totalHubBalance,
                  symbol: hub.symbol,
                  prefix: " + ",
                })}
            </Text>
          }
          bottomLabel={
            Big(totalInFarms).gt(0)
              ? t("liquidity:header.myLiquidity.value", {
                  value: totalInFarms,
                })
              : undefined
          }
          size="medium"
        />

        <Separator orientation="vertical" sx={{ height: 30 }} />

        <ValueStats
          label={t("totalValue")}
          customValue={
            <Text
              font="primary"
              fs="h7"
              lh={1}
              fw={700}
              color={getToken("text.high")}
            >
              {t("currency", { value: totalBalanceDisplay })}
            </Text>
          }
          size="medium"
        />

        {!isTablet && !isMobile && (
          <>
            <Separator orientation="vertical" sx={{ height: 30 }} />
            <ClaimCard />
          </>
        )}
      </Flex>
    </Flex>
  )
}
