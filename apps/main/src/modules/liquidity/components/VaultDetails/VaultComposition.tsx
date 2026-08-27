import {
  Box,
  Flex,
  Grid,
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
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const VaultComposition = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [token0, token1] = vault.tokens
  const { getAssetPrice } = useAssetsPrice([token0.id, token1.id])

  const human = (raw: bigint, decimals: number) =>
    t("common:number", {
      value: scaleHuman(raw.toString(), decimals),
      threshold: true,
      thresholdMaximumFractionDigits: 2,
    })

  const usd = (assetId: string, raw: bigint, decimals: number) => {
    const price = getAssetPrice(assetId)
    if (!price?.isValid) return undefined

    return t("common:currency", {
      value: Big(scaleHuman(raw.toString(), decimals))
        .times(price.price)
        .toString(),
    })
  }

  const state = vault.vault

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
      <Paper p="l" flex={1}>
        <Text as="h2" fs="base" fw={500} font="primary" mb="base">
          {t("vaults.composition.title")}
        </Text>

        <Stack gap="m" flex={1} separated>
          {rows.map((row) => (
            <Flex key={row.key} direction="column" gap="base">
              <Flex justify="space-between" align="center">
                <Text fs="p5" fw={600}>
                  {row.label}
                </Text>
              </Flex>
              <Grid columns={2} gap="l" align="center">
                <Amount
                  assetId={token0.id}
                  symbol={token0.symbol}
                  value={human(row.amount0, token0.decimals)}
                  displayValue={usd(token0.id, row.amount0, token0.decimals)}
                />
                <Amount
                  assetId={token1.id}
                  symbol={token1.symbol}
                  value={human(row.amount1, token1.decimals)}
                  displayValue={usd(token1.id, row.amount1, token1.decimals)}
                />
              </Grid>
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
        </Stack>
      </Paper>
    </Stack>
  )
}

const Amount = ({
  assetId,
  symbol,
  value,
  displayValue,
}: {
  assetId: string
  symbol: string
  value: string
  displayValue?: string
}) => (
  <Flex align="center" gap="s">
    <AssetLogo id={assetId} size="small" />
    <Flex direction="column" justify="center">
      <Flex align="center" gap="s">
        <Text fs="p6" lh={1} fw={500} fontVariantNumeric="tabular-nums">
          {value}
        </Text>
        <Text fs="p6" lh={1} fw={500} color={getToken("text.medium")}>
          {symbol}
        </Text>
      </Flex>
      {displayValue && (
        <Text
          fs="p7"
          color={getToken("text.low")}
          fontVariantNumeric="tabular-nums"
        >
          {displayValue}
        </Text>
      )}
    </Flex>
  </Flex>
)
