import {
  Box,
  Flex,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"
import { scaleHuman } from "@/utils/formatting"

const human = (raw: bigint, decimals: number) =>
  Big(scaleHuman(raw.toString(), decimals)).toFixed(6)

export const VaultComposition = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const state = vault.vault
  const [token0, token1] = vault.tokens

  if (!state) return null

  const rows = [
    {
      key: "base",
      label: t("vaults.composition.base"),
      amount0: state.base.amount0,
      amount1: state.base.amount1,
      range: [state.baseLower, state.baseUpper] as const,
    },
    {
      key: "limit",
      label: t("vaults.composition.limit"),
      amount0: state.limit.amount0,
      amount1: state.limit.amount1,
      range: [state.limitLower, state.limitUpper] as const,
    },
    {
      key: "idle",
      label: t("vaults.composition.idle"),
      amount0: state.idle.amount0,
      amount1: state.idle.amount1,
      range: undefined,
    },
  ]

  return (
    <Stack asChild>
      <Paper sx={{ p: "l", flex: 1, minWidth: 0 }}>
        <Text as="h2" fs="base" fw={500} font="primary">
          {t("vaults.composition.title")}
        </Text>

        <Flex direction="column" gap="m" sx={{ mt: "m", flex: 1 }}>
          {rows.map((row, index) => (
            <Flex key={row.key} direction="column" gap="s">
              {index > 0 && <Separator />}
              <Flex justify="space-between" align="center">
                <Text fs="p5" fw={600}>
                  {row.label}
                </Text>
                {row.range && (
                  <Text fs="p6" color={getToken("text.low")}>
                    {t("vaults.composition.ticks", {
                      lower: row.range[0],
                      upper: row.range[1],
                    })}
                  </Text>
                )}
              </Flex>
              <Flex gap="l">
                <Amount
                  assetId={token0.id}
                  symbol={token0.symbol}
                  value={human(row.amount0, token0.decimals)}
                />
                <Amount
                  assetId={token1.id}
                  symbol={token1.symbol}
                  value={human(row.amount1, token1.decimals)}
                />
              </Flex>
            </Flex>
          ))}

          {state.lastRebalance !== null && (
            <Box mt="auto">
              <Separator my="m" />
              <Flex justify="space-between" align="center">
                <Text fs="p6" color={getToken("text.low")}>
                  {t("liquidity:vaults.composition.lastRebalance")}
                </Text>
                <Text fs="p6">
                  {t("common:date.relative", {
                    value: new Date(state.lastRebalance * 1000),
                  })}
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </Paper>
    </Stack>
  )
}

const Amount = ({
  assetId,
  symbol,
  value,
}: {
  assetId: string
  symbol: string
  value: string
}) => (
  <Flex align="center" gap="s">
    <AssetLogo id={assetId} size="small" />
    <Text fs="p5" fw={500}>
      {value}
    </Text>
    <Text fs="p6" color={getToken("text.low")}>
      {symbol}
    </Text>
  </Flex>
)
