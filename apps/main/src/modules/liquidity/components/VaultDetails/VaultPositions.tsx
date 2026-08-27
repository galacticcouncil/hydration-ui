import { LiquidityIcon, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
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
import { STableHeader } from "@/modules/liquidity/components/PositionsTable/PositionsTable.styled"
import { RemoveVaultLiquidity } from "@/modules/liquidity/components/RemoveLiquidity/RemoveVaultLiquidity"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

/** One row per position; a vault holds exactly one per account */
type PositionRow = {
  shares: bigint
  valueDisplay: string | undefined
}

const columnHelper = createColumnHelper<PositionRow>()

const usePositionColumns = (
  vault: VaultTable,
  shareSymbol: string,
  onRemove: () => void,
) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [token0, token1] = vault.tokens

  return useMemo(
    () => [
      columnHelper.display({
        id: "position",
        size: 175,
        header: t("common:position"),
        cell: () => (
          <AssetLabelXYK
            iconIds={[token0.id, token1.id]}
            symbol={`${token0.symbol}/${token1.symbol}`}
          />
        ),
      }),
      columnHelper.accessor("shares", {
        id: "currentValue",
        header: t("liquidity:liquidity.positions.header.currentValue"),
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
        header: t("liquidity:liquidity.positions.header.actions"),
        meta: { sx: { textAlign: "right" } },
        cell: () => (
          <Flex gap="m" justify="end" align="center">
            <Button
              variant="tertiary"
              outline
              sx={{ flexShrink: 0 }}
              onClick={onRemove}
            >
              <Trash />
              {t("common:remove")}
            </Button>
          </Flex>
        ),
      }),
    ],
    [t, shareSymbol, onRemove, token0, token1],
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
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const { isMobile } = useBreakpoints()
  const columns = usePositionColumns(
    vault,
    vault.vault?.shareSymbol ?? "shares",
    () => setIsRemoveOpen(true),
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
      <STableHeader sx={{ justifyContent: "space-between" }}>
        <Flex
          align="center"
          gap="s"
          color={getToken("buttons.primary.high.hover")}
        >
          <Icon component={LiquidityIcon} size="xs" />
          <Text fw={500} font="primary">
            {t("liquidity:liquidity.positions.label.vault")}
          </Text>
        </Flex>

        {!!rows.length && (
          <Button
            variant="tertiary"
            outline
            onClick={() => setIsRemoveOpen(true)}
          >
            <Minus />
            {t("liquidity:removeLiquidity")}
          </Button>
        )}
      </STableHeader>
      <DataTable
        data={rows}
        columns={columns}
        columnPinning={{ left: ["position"] }}
        columnVisibility={{ position: !isMobile }}
        sx={{ minWidth: [undefined, 900] }}
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
      <Modal variant="popup" open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        {isRemoveOpen && (
          <RemoveVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setIsRemoveOpen(false)}
          />
        )}
      </Modal>
    </PositionsTableShell>
  )
}
