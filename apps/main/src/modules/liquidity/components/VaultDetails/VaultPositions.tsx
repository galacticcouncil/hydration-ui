import { LiquidityIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
  Button,
  DataTable,
  Flex,
  Icon,
  Modal,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { Minus } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelXYK } from "@/components/AssetLabelFull/AssetLabelFull"
import { PositionsTableShell } from "@/modules/liquidity/components/PositionsTable"
import { RemoveVaultLiquidity } from "@/modules/liquidity/components/RemoveLiquidity/RemoveVaultLiquidity"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

/** One row per position; a vault holds exactly one per account */
type PositionRow = {
  shares: bigint
  valueDisplay: string | undefined
}

const columnHelper = createColumnHelper<PositionRow>()

const RemoveAction = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="tertiary"
        outline
        size="small"
        disabled={vault.positionShares === 0n}
        onClick={() => setOpen(true)}
      >
        <Minus />
        {t("removeLiquidity")}
      </Button>
      <Modal variant="popup" open={open} onOpenChange={setOpen}>
        {open && (
          <RemoveVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}

const usePositionColumns = (vault: VaultTable, shareSymbol: string) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [token0, token1] = vault.tokens

  return useMemo(
    () => [
      columnHelper.display({
        id: "position",
        size: 250,
        header: t("common:position"),
        cell: () => (
          <Box height={66} py="xl" px="l">
            <AssetLabelXYK
              iconIds={[token0.id, token1.id]}
              symbol={`${token0.symbol}/${token1.symbol}`}
            />
          </Box>
        ),
      }),
      columnHelper.accessor("shares", {
        id: "amount",
        header: t("liquidity:liquidity.positions.header.amount"),
        cell: ({ row: { original } }) => (
          <Amount
            value={t("currency", {
              value: Big(original.shares.toString())
                .div(Big(10).pow(18))
                .toString(),
              symbol: shareSymbol,
            })}
            displayValue={t("currency", {
              value: Number(original.valueDisplay ?? 0),
            })}
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        meta: { sx: { textAlign: "right" } },
        cell: () => (
          <Flex justify="end">
            <RemoveAction vault={vault} />
          </Flex>
        ),
      }),
    ],
    [t, shareSymbol, vault, token0, token1],
  )
}

export const VaultPositions = ({
  vault,
  isDisconnected,
  isPositionError,
}: {
  vault: VaultTable
  isDisconnected?: boolean
  isPositionError?: boolean
}) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [expanded, setExpanded] = useState(true)
  const { isMobile } = useBreakpoints()
  const columns = usePositionColumns(
    vault,
    vault.vault?.shareSymbol ?? "shares",
  )

  const rows: PositionRow[] =
    vault.positionShares > 0n
      ? [
          {
            shares: vault.positionShares,
            valueDisplay: vault.positionValueDisplay,
          },
        ]
      : []

  if (!isPositionError && vault.positionShares === 0n) return null

  return (
    <PositionsTableShell
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      totalBalanceDisplay={vault.positionValueDisplay ?? "0"}
    >
      <Flex
        align="center"
        gap="s"
        color={getToken("buttons.primary.high.hover")}
        sx={{ px: ["base", "l"], pt: "l" }}
      >
        <Icon component={LiquidityIcon} size="xs" />
        <Text fw={500} font="primary">
          {t("liquidity:liquidity.positions.label.vault")}
        </Text>
      </Flex>
      <DataTable
        size={isMobile ? "small" : "large"}
        data={rows}
        columns={columns}
        emptyState={
          <Text fs="p5" color={getToken("text.low")}>
            {isDisconnected
              ? t("liquidity:vaults.position.disconnected")
              : isPositionError
                ? t("liquidity:vaults.position.error")
                : t("liquidity:vaults.position.empty")}
          </Text>
        }
      />
    </PositionsTableShell>
  )
}
