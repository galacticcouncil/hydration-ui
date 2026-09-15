import {
  Button,
  Chip,
  ChipVariant,
  Flex,
  Modal,
  Skeleton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelXYK } from "@/components/AssetLabelFull/AssetLabelFull"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"
import { VaultStatus, VaultTable } from "@/modules/liquidity/Vaults.utils"

const columnHelper = createColumnHelper<VaultTable>()

export const getVaultsColumnsVisibility = (isMobile: boolean) => ({
  vaultTvlDisplay: !isMobile,
  volumeDisplay: !isMobile,
  apr: !isMobile,
  price: !isMobile,
  status: !isMobile,
  actions: !isMobile,
})

const STATUS_VARIANT: Record<VaultStatus, ChipVariant> = {
  empty: "blue",
  inRange: "green",
  outOfRange: "amber",
  depositsClosed: "amber",
  notStarted: "tertiary",
  noVault: "blue",
}

const VaultActions = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [open, setOpen] = useState(false)

  return (
    <Flex
      gap="s"
      justify="end"
      onClick={(e) => e.stopPropagation()}
      position="relative"
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

      {vault.positionShares > 0n && (
        <Text
          color={getToken("text.tint.secondary")}
          fw={500}
          fs="p6"
          position="absolute"
          bottom="-xl"
        >
          {t("liquidity:liquidity.pool.positions.total", {
            value: vault.positionValueDisplay ?? 0,
          })}
        </Text>
      )}
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
      columnHelper.accessor("price", {
        header: t("liquidity:vaults.column.price"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) => {
          const [token0, token1] = original.tokens

          return (
            <Text>
              {t("liquidity:vaults.price.pair", {
                value: original.price ?? 0,
                symbolA: token0.symbol,
                symbolB: token1.symbol,
              })}
            </Text>
          )
        },
      }),
      columnHelper.accessor("vaultTvlDisplay", {
        header: t("liquidity:totalValueLocked"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) =>
          original.vault ? (
            t("currency", { value: Number(original.vaultTvlDisplay ?? 0) })
          ) : (
            <Text color={getToken("text.low")}>&mdash;</Text>
          ),
      }),
      columnHelper.accessor("volumeDisplay", {
        header: t("liquidity:24hVolume"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) =>
          original.isVolumeLoading ? (
            <Skeleton width={60} height="1em" />
          ) : original.volumeDisplay !== undefined ? (
            t("currency", { value: Number(original.volumeDisplay) })
          ) : (
            <Text color={getToken("text.low")}>&mdash;</Text>
          ),
        sortingFn: (a, b) =>
          Big(a.original.volumeDisplay ?? 0).gt(b.original.volumeDisplay ?? 0)
            ? 1
            : -1,
      }),
      columnHelper.accessor("apr", {
        header: t("liquidity:vaults.column.apr"),
        meta: { sx: { textAlign: isMobile ? "right" : "left" } },
        cell: ({ row: { original } }) =>
          original.isVolumeLoading ? (
            <Skeleton width={50} height="1em" />
          ) : original.apr !== undefined ? (
            <Tooltip text={t("liquidity:vaults.column.apr.tooltip")}>
              <Text>{t("percent", { value: original.apr })}</Text>
            </Tooltip>
          ) : (
            <Text color={getToken("text.low")}>&mdash;</Text>
          ),
        sortingFn: (a, b) =>
          Big(a.original.apr ?? 0).gt(b.original.apr ?? 0) ? 1 : -1,
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
