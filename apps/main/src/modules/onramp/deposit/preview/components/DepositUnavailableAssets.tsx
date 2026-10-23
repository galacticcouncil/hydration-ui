import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DepositUnavailableBalance } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import { toDecimal } from "@/utils/formatting"

type DepositUnavailableAssetsProps = { rows: DepositUnavailableBalance[] }

export const DepositUnavailableAssets: FC<DepositUnavailableAssetsProps> = ({
  rows,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  if (!rows.length) return null
  return (
    <CollapsibleRoot>
      <CollapsibleTrigger asChild>
        <Button
          variant="transparent"
          width="100%"
          p="m"
          sx={{
            height: "auto",
            justifyContent: "space-between",
            whiteSpace: "normal",
          }}
        >
          {t("deposit.v3.assets.unavailableCount", { count: rows.length })}
          <Icon component={ChevronDown} size="m" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Stack gap="m" p="m" justify="flex-start">
          {rows.map((row) => (
            <Flex
              key={row.key}
              gap="base"
              justify="space-between"
              align="center"
            >
              <Stack gap="s" justify="flex-start">
                <Text fs="p5">
                  {t("common:currency", {
                    value: toDecimal(row.balance.amount, row.balance.decimals),
                    symbol: row.balance.originSymbol,
                  })}
                </Text>
                <Text fs="p6" color={getToken("text.low")}>
                  {row.source.chain.name} · {row.source.account.name}
                </Text>
              </Stack>
              <Text fs="p6" color={getToken("text.medium")}>
                {t(
                  row.reason === "tooSmall"
                    ? "deposit.v3.assets.tooSmall"
                    : "deposit.v3.assets.noRoute",
                )}
              </Text>
            </Flex>
          ))}
        </Stack>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
