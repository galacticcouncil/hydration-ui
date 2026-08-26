import {
  Button,
  Chip,
  ChipVariant,
  Flex,
  Modal,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelXYK } from "@/components/AssetLabelFull/AssetLabelFull"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"

import { VaultStatus, VaultTable } from "./Vaults.utils"

const columnHelper = createColumnHelper<VaultTable>()

export const getVaultsColumnsVisibility = (isMobile: boolean) => ({
  vaultTvlDisplay: !isMobile,
  tvlDisplay: !isMobile,
  price: !isMobile,
  status: !isMobile,
  actions: !isMobile,
})

const STATUS_VARIANT: Record<VaultStatus, ChipVariant> = {
  empty: "blue",
  inRange: "green",
  outOfRange: "amber",
  depositsClosed: "amber",
  notStarted: "blue",
  noVault: "blue",
}

const VaultActions = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [open, setOpen] = useState(false)

  return (
    // the row navigates on click, so the buttons keep theirs to themselves
    <Flex
      gap="s"
      justify="end"
      onClick={(e) => e.stopPropagation()}
      sx={{ position: "relative" }}
    >
      <Button
        variant="accent"
        outline
        disabled={!vault.canDeposit}
        onClick={() => setOpen(true)}
      >
        {t("liquidity:joinPool")}
      </Button>

      <Button variant="tertiary" outline asChild>
        <Link to="/liquidity/vault/$address" params={{ address: vault.id }}>
          {vault.positionShares > 0n ? t("common:manage") : t("common:details")}
        </Link>
      </Button>

      <Modal variant="popup" open={open} onOpenChange={setOpen}>
        {open && (
          <AddVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setOpen(false)}
          />
        )}
      </Modal>
    </Flex>
  )
}

export const useVaultsColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      columnHelper.accessor("id", {
        id: "vault",
        size: 300,
        header: t("liquidity:vaults.column.vault"),
        cell: ({ row: { original } }) => (
          <AssetLabelXYK
            iconIds={original.tokens.map((token) => token.id)}
            symbol={original.tokens.map((token) => token.symbol).join(" / ")}
            badge={<AutoManagedBadge />}
          />
        ),
      }),
      columnHelper.accessor("vaultTvlDisplay", {
        header: t("liquidity:vaults.column.vaultLiquidity"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) =>
          original.vault ? (
            t("currency", { value: Number(original.vaultTvlDisplay ?? 0) })
          ) : (
            <Text fs="p5" color={getToken("text.low")}>
              &mdash;
            </Text>
          ),
      }),
      columnHelper.accessor("tvlDisplay", {
        header: t("liquidity:vaults.column.poolLiquidity"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) =>
          t("currency", { value: Number(original.tvlDisplay ?? 0) }),
      }),
      columnHelper.accessor("price", {
        header: t("liquidity:vaults.column.price"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) => {
          const [token0, token1] = original.tokens

          return (
            <Text fs="p5">
              1 {token0.symbol} = {Number(original.price ?? 0).toFixed(4)}{" "}
              {token1.symbol}
            </Text>
          )
        },
      }),
      columnHelper.display({
        id: "status",
        header: t("liquidity:vaults.column.status"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) => (
          <Tooltip
            text={t(`liquidity:vaults.status.${original.status}.tooltip`)}
          >
            <Chip
              variant={STATUS_VARIANT[original.status]}
              size="small"
              rounded
            >
              {t(`liquidity:vaults.status.${original.status}`)}
            </Chip>
          </Tooltip>
        ),
      }),
      columnHelper.display({
        id: "actions",
        meta: { sx: { textAlign: "right" } },
        cell: ({ row: { original } }) => <VaultActions vault={original} />,
      }),
    ],
    [t, isMobile],
  )
}
