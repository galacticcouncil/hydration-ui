import {
  Button,
  CopyButton,
  Flex,
  Modal,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"
import { PoolDetailsHeaderShell } from "@/modules/liquidity/components/PoolDetailsHeader"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

const AddressTag = ({
  label,
  address,
}: {
  label: string
  address: string | undefined
}) => {
  if (!address) return null

  return (
    <Flex align="center" gap="xs">
      <Text fs="p6" color={getToken("text.low")}>
        {label}
      </Text>
      <Text fs="p6" color={getToken("text.medium")}>
        {shortenAccountAddress(address)}
      </Text>
      <CopyButton text={address} iconSize="xs" />
    </Flex>
  )
}

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
            <AddressTag
              label={t("vaults.header.vault")}
              address={vault.vault?.address}
            />
            <AddressTag label={t("vaults.header.pool")} address={vault.id} />
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
