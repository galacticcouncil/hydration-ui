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
    <Flex direction="column" gap={8}>
      <CollapsibleRoot open={expanded}>
        <Flex align="center" justify="space-between" my={8}>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("liquidity.add.modal.reserves")}
          </Text>

          <CollapsibleTrigger
            onClick={() => setExpanded((prev) => !prev)}
            sx={{ cursor: "pointer", ":hover": { opacity: 0.6 } }}
          >
            <Flex gap={8} align="center">
              {isLoading ? (
                <Skeleton width={50} height={12} />
              ) : (
                <Text fs="p4" fw={500} color={getToken("text.high")}>
                  {t("common:currency", { value: totalDisplayAmount })}
                </Text>
              )}

              <Icon
                component={ChevronDown}
                size={18}
                color={getToken("text.low")}
                sx={{
                  transition: getToken("transitions.transform"),
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Flex>
          </CollapsibleTrigger>
        </Flex>

        {expanded && separator}

        <CollapsibleContent>
          <Flex direction="column" gap={8} my={8}>
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
