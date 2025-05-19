import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Trans, useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"
import { useStablepoolReserves } from "@/modules/liquidity/Liquidity.utils"

export const CurrencyReserves = ({ id }: { id: string }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { reserves, totalDisplayAmount } = useStablepoolReserves(id)

  return (
    <Flex direction="column" gap={10}>
      <Text
        fw={500}
        fs="h7"
        color={getToken("text.tint.secondary")}
        font="primary"
      >
        {t("liquidity:liquidity.stablepool.currencyReserves.label")}
      </Text>

      <Separator mx={-20} />

      {reserves.map((reserve) => (
        <>
          <Flex key={reserve.asset_id} justify="space-between">
            <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
              <Logo id={reserve.asset_id.toString()} size="small" />
              <Text color={getToken("text.high")} fs="p3" fw={600}>
                {reserve.meta.symbol}
              </Text>
            </Flex>

            <Flex align="center" gap={6}>
              <Trans
                t={t}
                i18nKey="liquidity:liquidity.stablepool.currencyReserves.amount"
                values={{
                  value: reserve.amountHuman,
                  percentage: reserve.displayAmount
                    ? Big(reserve.displayAmount)
                        .div(totalDisplayAmount)
                        .times(100)
                        .toFixed(1)
                    : 0,
                }}
              >
                <Text color={getToken("text.high")} fw={500} fs={13} />
                <Text color={getToken("text.low")} fw={500} fs={13} />
              </Trans>
            </Flex>
          </Flex>
          <Separator mx={-20} />
        </>
      ))}
    </Flex>
  )
}
