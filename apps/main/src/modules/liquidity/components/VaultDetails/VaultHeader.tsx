import {
  Button,
  CopyButton,
  Flex,
  Modal,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { AddVaultLiquidity } from "@/modules/liquidity/components/AddVaultLiquidity/AddVaultLiquidity"
import { AutoManagedBadge } from "@/modules/liquidity/components/AutoManagedBadge"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

const shorten = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`

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
        {shorten(address)}
      </Text>
      <CopyButton text={address} iconSize="xs" />
    </Flex>
  )
}

export const VaultHeader = ({ vault }: { vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [token0, token1] = vault.tokens
  const [open, setOpen] = useState(false)

  return (
    <Flex justify="space-between" align="center" gap="m" sx={{ mb: "xl" }}>
      <Flex align="center" gap="m">
        <AssetLogo id={[token0.id, token1.id]} size="large" />
        <Flex direction="column">
          <Text font="primary" fw={700} fs="p1" lh="130%">
            {token0.symbol}, {token1.symbol}
          </Text>
          <Flex align="center" gap="m" sx={{ flexWrap: "wrap" }}>
            <AutoManagedBadge />
            <AddressTag
              label={t("vaults.header.vault")}
              address={vault.vault?.address}
            />
            <AddressTag label={t("vaults.header.pool")} address={vault.id} />
          </Flex>
        </Flex>
      </Flex>

      <Button disabled={!vault.canDeposit} onClick={() => setOpen(true)}>
        {t("vaults.action.deposit")}
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
