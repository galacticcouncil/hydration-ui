import {
  Amount,
  Button,
  Flex,
  ProgressBar,
  Stack,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  type PropellerVaultMarket,
  vaultDepositState,
} from "@/modules/strategies/propeller/hooks/usePropellerVaults"

const columnHelper = createColumnHelper<PropellerVaultMarket>()

export const useStrategyVaultColumns = (
  onDeposit: (vault: PropellerVaultConfig) => void,
) => {
  const { t } = useTranslation(["propeller", "common"])

  return useMemo(() => {
    const assetColumn = columnHelper.display({
      id: "asset",
      header: t("strategy.col.asset"),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original.asset} />
      },
    })

    const tvlColumn = columnHelper.display({
      id: "tvl",
      header: t("strategy.col.tvl"),
      cell: ({ row }) => {
        const { asset, stats, tvlUsd } = row.original
        return (
          <Amount
            value={t("common:currency", {
              value: stats?.tvl ?? 0,
              symbol: asset.symbol,
            })}
            displayValue={t("common:currency.compact", { value: tvlUsd })}
          />
        )
      },
    })

    const apyColumn = columnHelper.display({
      id: "netApy",
      header: () => (
        <Flex gap="xs" align="center">
          {t("strategy.col.netApy")}
          <Tooltip
            text={
              <Stack gap="base">
                {(
                  t("strategy.apyEstimate", { returnObjects: true }) as string[]
                ).map((line) => (
                  <Text key={line} fw={500} fs="p5">
                    {line}
                  </Text>
                ))}
              </Stack>
            }
          />
        </Flex>
      ),
      cell: ({ row }) => {
        const { apy } = row.original
        return (
          <Text
            fs="p4"
            fw={600}
            color={getToken(
              apy === null || apy <= 0
                ? "text.high"
                : "accents.success.emphasis",
            )}
          >
            {apy === null ? "—" : t("common:percent", { value: apy })}
          </Text>
        )
      },
    })

    const capacityColumn = columnHelper.display({
      id: "remainingCapacity",
      header: t("strategy.remainingCapacity"),
      cell: ({ row }) => {
        const { asset, stats } = row.original
        if (!stats || stats.cap <= 0) return null
        return (
          <Stack gap="xs" width="100%" minWidth="3xl">
            <Flex justify="space-between" gap="s">
              <Text
                fs={["p5", null, "p6"]}
                fw={500}
                color={getToken("text.high")}
              >
                {t("common:currency", {
                  value: stats.remaining,
                  symbol: asset.symbol,
                })}
              </Text>
              <Text
                fs="p6"
                fw={600}
                color={getToken("text.tint.quart")}
                display={["none", null, "block"]}
              >
                {t("common:percent", { value: stats.remainingPct })}
              </Text>
            </Flex>
            <ProgressBar
              value={stats.remainingPct}
              size="small"
              hideLabel
              sx={{ display: ["none", null, "block"] }}
            />
          </Stack>
        )
      },
    })

    const deploymentColumn = columnHelper.display({
      id: "pendingDeployment",
      header: () => (
        <Flex gap="xs" align="center">
          {t("strategy.pendingDeployment")}
          <Tooltip
            text={
              <Stack gap="base">
                {(
                  t("strategy.deploymentDescription", {
                    returnObjects: true,
                  }) as string[]
                ).map((line) => (
                  <Text key={line} fw={500} fs="p5">
                    {line}
                  </Text>
                ))}
              </Stack>
            }
          />
        </Flex>
      ),
      cell: ({ row }) => {
        const { asset, stats } = row.original
        const pendingDeployment = stats?.pendingDeployment
        return (
          <Text fs="p4">
            {typeof pendingDeployment === "string"
              ? t("common:currency", {
                  value: pendingDeployment,
                  symbol: asset.symbol,
                })
              : "—"}
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row }) => {
        const { vault, stats } = row.original
        const state = vaultDepositState(stats)
        return (
          <Flex justify="flex-end">
            <Button
              size="small"
              disabled={state !== "open"}
              onClick={() => onDeposit(vault)}
              variant="secondary"
            >
              {state === "unavailable"
                ? t("deposit.cta.unavailable")
                : state === "paused"
                  ? t("strategy.action.paused")
                  : state === "full"
                    ? t("strategy.action.full")
                    : t("strategy.action.deposit")}
            </Button>
          </Flex>
        )
      },
    })

    return [
      assetColumn,
      tvlColumn,
      apyColumn,
      deploymentColumn,
      capacityColumn,
      actionsColumn,
    ]
  }, [t, onDeposit])
}
