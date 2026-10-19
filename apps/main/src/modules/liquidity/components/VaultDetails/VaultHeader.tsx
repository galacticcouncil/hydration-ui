import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  MenuItemLabel,
  MenuSelectionItem,
  Modal,
} from "@galacticcouncil/ui/components"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AddressTag } from "@/components/AddressTag"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"
import { PoolDetailsHeaderShell } from "@/modules/liquidity/components/PoolDetailsHeader"
import { TransferVaultPosition } from "@/modules/liquidity/components/TransferVaultPosition/TransferVaultPosition"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

export const VaultHeader = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [token0, token1] = vault.pair
  const [open, setOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  return (
    <>
      <PoolDetailsHeaderShell
        logoId={[token0.id, token1.id]}
        title={t("vaults.header.title", {
          symbolA: token0.symbol,
          symbolB: token1.symbol,
        })}
        subtitle={
          <Flex align="center" gap="m" wrap>
            <AutoManagedBadge />
            <Flex gap="base">
              <AddressTag
                label={t("vaults.header.vault")}
                address={vault.vault?.address}
                linkType="contract"
              />
              <AddressTag
                label={t("vaults.header.pool")}
                address={vault.id}
                linkType="contract"
              />
            </Flex>
          </Flex>
        }
        actions={
          <Flex gap="base" align="center" width="100%">
            <Button
              size="medium"
              width="100%"
              disabled={!vault.canDeposit}
              onClick={() => setOpen(true)}
            >
              {t("vaults.action.deposit")}
            </Button>
            {vault.vault && vault.positionShares > 0n && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="medium"
                    variant="muted"
                    outline
                    aria-label={t("common:more")}
                    sx={{ p: "m" }}
                  >
                    <Icon component={MoreHorizontal} size="s" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <MenuSelectionItem onClick={() => setTransferOpen(true)}>
                      <MenuItemLabel>
                        {t("vaults.action.transfer")}
                      </MenuItemLabel>
                    </MenuSelectionItem>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Flex>
        }
      />

      <Modal variant="popup" open={transferOpen} onOpenChange={setTransferOpen}>
        {transferOpen && (
          <TransferVaultPosition
            vault={vault}
            onClose={() => setTransferOpen(false)}
          />
        )}
      </Modal>
      <Modal variant="popup" open={open} onOpenChange={setOpen}>
        {open && (
          <AddVaultLiquidity
            vault={vault}
            closable
            onSubmitted={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}
