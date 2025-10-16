import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleTrigger,
  Flex,
  Icon,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { DepositPosition } from "@/states/account"

import { ClaimCard } from "./ClaimCard"

type PositionsHeaderProps = {
  onClick: () => void
  showMore: boolean
  totalInFarms: string
  totalBalanceDisplay: string
  positions: DepositPosition[]
}

export const PositionsHeader = ({
  onClick,
  showMore,
  totalInFarms,
  totalBalanceDisplay,
  positions,
}: PositionsHeaderProps) => {
  const { t } = useTranslation(["common", "liquidity"])
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
          label={t("totalValue")}
          wrap
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
          bottomLabel={
            Big(totalInFarms).gt(0)
              ? t("liquidity:header.myLiquidity.value", {
                  value: totalInFarms,
                })
              : undefined
          }
          size="medium"
        />

        {!isTablet && !isMobile && <ClaimCard positions={positions} />}
      </Flex>
    </Flex>
  )
}
