import { AccountAvatar, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AccountDeleteButton } from "@/components/account/AccountDeleteButton"
import { ShortAddress } from "@/components/account/ShortAddress"
import { Address } from "@/components/address-book/AddressBook.store"
import { SAccountTile } from "@/components/content/WalletManagementAccounts.styled"

type Props = Pick<Address, "address" | "name"> & {
  readonly onSelect: () => void
  readonly onDelete?: () => void
}

export const ExternalWalletOption: React.FC<Props> = ({
  address,
  name,
  onSelect,
  onDelete,
}) => {
  const { t } = useTranslation()
  const shortAddress = shortenAccountAddress(address)

  return (
    <SAccountTile
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key !== "Enter" && event.key !== " ") return

        event.preventDefault()
        onSelect()
      }}
    >
      <AccountAvatar address={address} size={24} />
      <Text fs="p4" fw={500} color={getToken("text.high")} flex={1} truncate>
        {name || shortAddress}
      </Text>
      <Text fs="p5" fw={500} color={getToken("text.medium")} flexShrink={0}>
        <ShortAddress address={address} length={6} />
      </Text>
      {onDelete && (
        <AccountDeleteButton
          aria-label={t("addressBook.deleteAddress")}
          onClick={onDelete}
        />
      )}
    </SAccountTile>
  )
}
