import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components/Flex"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { CurrencyReservesRow } from "@/modules/liquidity/components/PoolDetailsValues/CurrencyReserves"
import { useStablepoolReserves } from "@/modules/liquidity/Liquidity.utils"

export const StablepoolReserves = ({
  poolId,
  separator,
}: {
  poolId: string
  separator: React.ReactNode
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [expanded, setExpanded] = useState(false)
  const { data, isLoading } = useStablepoolReserves(poolId)

  if (!isLoading && !data) return null

  const { reserves, totalDisplayAmount } = data ?? {}

  return (
    <Flex direction="column" gap="base">
      <CollapsibleRoot open={expanded}>
        <CollapsibleTrigger
          onClick={() => setExpanded((prev) => !prev)}
          sx={{
            cursor: "pointer",
            ":hover": { backgroundColor: getToken("controls.dim.base") },
            width: "calc(100% + var(--modal-content-padding) * 2)",
            mx: "var(--modal-content-inset)",
            px: "var(--modal-content-padding)",
          }}
        >
          <Flex align="center" justify="space-between" my="base">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("liquidity.add.modal.reserves")}
            </Text>
            <Flex gap="base" align="center">
              {isLoading ? (
                <Skeleton width={50} height={12} />
              ) : (
                <Text fs="p4" fw={500} color={getToken("text.high")}>
                  {t("common:currency", { value: totalDisplayAmount })}
                </Text>
              )}

              <Icon
                component={ChevronDown}
                size="m"
                color={getToken("text.low")}
                sx={{
                  transition: getToken("transitions.transform"),
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Flex>
          </Flex>
        </CollapsibleTrigger>

        {expanded && separator}

        <CollapsibleContent>
          <Flex direction="column" gap="base" my="base">
            {totalDisplayAmount &&
              reserves?.map((reserve, index) => (
                <CurrencyReservesRow
                  key={reserve.asset_id}
                  reserve={reserve}
                  totalDisplayAmount={totalDisplayAmount}
                  separator={
                    index === reserves.length - 1 ? undefined : separator
                  }
                  loading={isLoading}
                />
              ))}
          </Flex>
        </CollapsibleContent>
      </CollapsibleRoot>
    </Flex>
  )
}
