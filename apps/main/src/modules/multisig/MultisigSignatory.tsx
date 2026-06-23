import {
  AccountAvatar,
  Chip,
  EditableText,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  safeConvertAddressSS58,
  safeConvertSS58toPublicKey,
  shortenAccountAddress,
  stringEquals,
} from "@galacticcouncil/utils"
import { getIdentityQuery, useAccount } from "@galacticcouncil/web3-connect"
import { useAddressStore } from "@galacticcouncil/web3-connect/src/components/address-book/AddressBook.store"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useRpcProvider } from "@/providers/rpcProvider"

export type MultisigSignatoryProps = {
  address: string
}

export const MultisigSignatory: React.FC<MultisigSignatoryProps> = ({
  address,
}) => {
  const { t } = useTranslation()
  const { papi } = useRpcProvider()
  const { account } = useAccount()

  const addresses = useAddressStore((s) => s.addresses)
  const addAddress = useAddressStore((s) => s.add)
  const editAddress = useAddressStore((s) => s.edit)

  const publicKey = safeConvertSS58toPublicKey(address)
  const existing = addresses.find((a) => stringEquals(a.publicKey, publicKey))
  const localName = existing?.name?.trim() ?? ""

  const isConnected =
    !!account &&
    (account.isMultisig
      ? stringEquals(account?.multisigSignerAddress ?? "", address)
      : stringEquals(account.address, address))

  const { data: identity } = useQuery(
    getIdentityQuery(papi, !localName ? address : ""),
  )
  const onChainName = identity?.display?.trim() ?? ""
  const displayName = localName || onChainName

  const handleNameChange = (name: string) => {
    if (existing) {
      editAddress({ ...existing, name })
    } else {
      addAddress({
        address,
        publicKey,
        name,
        provider: WalletProviderType.PolkadotJS,
        isCustom: true,
      })
    }
  }

  return (
    <Flex align="center" gap="s" width="100%" minWidth={0}>
      <AccountAvatar address={address} size={32} sx={{ flexShrink: 0 }} />
      <Stack flex={1} minWidth={0}>
        <EditableText
          value={displayName}
          placeholder={t("multisig.detail.noName")}
          onChange={handleNameChange}
          disabled={!!existing && !existing.isCustom}
          fs="p4"
          lh={1.3}
          fw={500}
        />
        <Text fs="p5" color={getToken("text.medium")} truncate>
          {shortenAccountAddress(safeConvertAddressSS58(address))}
        </Text>
      </Stack>
      {isConnected && (
        <Chip size="small" variant="tertiary" sx={{ flexShrink: 0 }}>
          {t("you")}
        </Chip>
      )}
    </Flex>
  )
}
