import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { Chip } from "@galacticcouncil/ui/components"
import {
  safeConvertAddressSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { AccountOption } from "@/components/account/AccountOption"
import { WalletProviderType } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { MultisigConfig } from "@/hooks/useMultisigStore"

type Props = {
  config: MultisigConfig
  isActive?: boolean
  isBalanceLoading?: boolean
  onSelect: (config: MultisigConfig) => void
  onRename?: (config: MultisigConfig, newName: string) => void
  onDelete?: (id: string) => void
}

export const AccountMultisigOption: React.FC<Props> = ({
  config,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) => {
  const { t } = useTranslation()
  const { squidSdk } = useWeb3ConnectContext()
  const publicKey = safeConvertSS58toPublicKey(config.address)

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery(
    latestAccountBalanceQuery(squidSdk, publicKey),
  )

  const balance = (() => {
    const node = balanceData?.accountTotalBalanceHistoricalData?.nodes.at(0)
    if (!node) return undefined
    const transferable = Number(node.totalTransferableNorm) || 0
    const locked = Number(node.totalLockedNorm) || 0
    return transferable + locked
  })()

  return (
    <AccountOption
      isActive={isActive}
      onSelect={() => onSelect(config)}
      onEdit={onRename ? (name) => onRename(config, name) : undefined}
      onDelete={
        config.isCustom && onDelete ? () => onDelete(config.id) : undefined
      }
      name={config.name}
      publicKey={publicKey}
      address={config.address}
      rawAddress={config.address}
      provider={WalletProviderType.Multisig}
      displayAddress={safeConvertAddressSS58(config.address)}
      isBalanceLoading={isBalanceLoading}
      balance={balance}
      nameBadge={
        <Chip variant="green" size="small">
          {t("multisig.setup.thresholdLabel")} {config.threshold}/
          {config.signers.length}
        </Chip>
      }
    />
  )
}
