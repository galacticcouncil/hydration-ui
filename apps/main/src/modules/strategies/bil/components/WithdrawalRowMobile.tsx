import {
  Flex,
  Paper,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { hoursToMilliseconds } from "date-fns"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { WithdrawalRowActions } from "@/modules/strategies/bil/components/WithdrawalRowActions"
import { type WithdrawalRow } from "@/modules/strategies/bil/components/Withdrawals.columns"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"

type Props = {
  readonly row: WithdrawalRow
}

export const WithdrawalRowMobile = ({ row }: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const { isMobile } = useBreakpoints()
  const { bil, hollar } = useBilStrategy()

  const claimable = row.claimableBil ?? 0

  const timeRemainingValue = (() => {
    if (claimable > 0) {
      return (
        <Text fs="p4" fw={600} color={getToken("accents.success.primary")}>
          {t("bil.withdrawals.state.claimable")}
        </Text>
      )
    }
    const days = row.timeRemainingDays ?? 0
    return (
      <Text fs="p4" fw={600} color={getToken("accents.alert.primary")}>
        {t("common:interval", {
          value: hoursToMilliseconds(days * 24),
          unit: "d",
        })}
      </Text>
    )
  })()

  return (
    <Paper p="l" shadow={false} bg="dim" borderRadius="l">
      <Flex align="center" justify="space-between" gap="m" wrap>
        <Flex align="center" gap="s" minWidth={0}>
          <AssetLogo id={bil.id} size="small" />
          <Text fs="p3" fw={500} color={getToken("text.high")}>
            {t("common:currency", {
              value: row.amountBil,
              symbol: bil.symbol,
            })}
          </Text>
        </Flex>
        {!isMobile && <WithdrawalRowActions row={row} />}
      </Flex>
      <Separator my="m" mx="-l" />
      <Flex justify="space-between" gap="l" align="start" wrap>
        <ValueStats
          wrap
          size="small"
          font="secondary"
          label={t("bil.withdrawals.col.estValue")}
          customValue={
            <Text fs="p4" fw={500} color={getToken("text.high")}>
              {t("common:currency", {
                value: row.estHollar,
                symbol: hollar.symbol,
              })}
            </Text>
          }
          bottomLabel={t("common:currency", {
            value: row.estHollar,
          })}
        />
        <Flex sx={{ textAlign: "right", alignItems: "flex-end" }}>
          <ValueStats
            wrap
            size="small"
            font="secondary"
            label={t("bil.withdrawals.col.timeRemaining")}
            customValue={timeRemainingValue}
          />
        </Flex>
      </Flex>
      {isMobile && (
        <Flex gap="base" mt="l">
          <WithdrawalRowActions row={row} />
        </Flex>
      )}
    </Paper>
  )
}
