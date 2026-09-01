import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AddressTag } from "@/components/AddressTag"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"
import { PoolDetailsHeaderShell } from "@/modules/liquidity/components/PoolDetailsHeader"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

export const VaultHeader = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [token0, token1] = vault.tokens
  const [open, setOpen] = useState(false)
  const { isMobile } = useBreakpoints()

  return (
    <>
      <PoolDetailsHeaderShell
        logoId={[token0.id, token1.id]}
        title={`${token0.symbol}, ${token1.symbol}`}
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
          <Button
            size={isMobile ? "medium" : "small"}
            width="100%"
            disabled={!vault.canDeposit}
            onClick={() => setOpen(true)}
          >
            {t("vaults.action.deposit")}
          </Button>
        }
      />

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
