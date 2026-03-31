import { Users } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { latestAccountBalanceQuery } from "@galacticcouncil/indexer/squid"
import { formatCurrency, safeConvertSS58toPublicKey, shortenAccountAddress } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"

import { SAccountOption, SCopyButton } from "@/components/account/AccountOption.styled"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { MultisigConfig } from "@/hooks/useMultisigStore"
import { toPolkadotAddress } from "@/utils/multisig"

type Props = {
  config: MultisigConfig
  isActive?: boolean
  isBalanceLoading?: boolean
  onSelect: (config: MultisigConfig) => void
}

export const AccountMultisigOption: React.FC<Props> = ({
  config,
  isActive,
  onSelect,
}) => {
  const { squidSdk } = useWeb3ConnectContext()
  const polkadotAddress = toPolkadotAddress(config.address)
  const publicKey = safeConvertSS58toPublicKey(config.address)

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery(
    latestAccountBalanceQuery(squidSdk, publicKey),
  )

  const balance = (() => {
    const node =
      balanceData?.accountTotalBalanceHistoricalData?.nodes.at(0)
    if (!node) return undefined
    const transferable = Number(node.totalTransferableNorm) || 0
    const locked = Number(node.totalLockedNorm) || 0
    return transferable + locked
  })()

  return (
    <SAccountOption data-active={isActive} onClick={() => onSelect(config)}>
      <Flex align="center" gap="m">
        <Icon
          size="m"
          component={Users}
          color={getToken("text.high")}
          sx={{ flexShrink: 0 }}
        />
        <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="s" sx={{ minWidth: 0 }}>
              <Text fs="p3" truncate={200}>
                {config.name ||
                  `Multisig ${config.threshold}/${config.signers.length}`}
              </Text>
              <Text fs="p6" color={getToken("text.medium")} sx={{ flexShrink: 0 }}>
                {config.threshold}/{config.signers.length}
              </Text>
            </Flex>
            {isBalanceLoading ? (
              <Skeleton sx={{ width: 75, ml: "auto" }} />
            ) : (
              balance !== undefined && (
                <Text fs="p3">{formatCurrency(balance)}</Text>
              )
            )}
          </Flex>
          <Flex align="center" justify="space-between" gap="s">
            <Text fs="p4" color={getToken("text.medium")} sx={{ minWidth: 0 }}>
              <Text as="span" truncate display={["none", "block"]}>
                {polkadotAddress}
              </Text>
              <Text as="span" display={["block", "none"]}>
                {shortenAccountAddress(polkadotAddress, 12)}
              </Text>
            </Text>
            <span onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <SCopyButton text={polkadotAddress} />
            </span>
          </Flex>
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
