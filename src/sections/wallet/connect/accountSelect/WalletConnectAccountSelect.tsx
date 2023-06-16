import { useProviderAccounts } from "components/AddressBook/AddressBook.utils"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"
import { Account, externalWallet } from "state/store"
import { SContainer } from "./WalletConnectAccountSelect.styled"
import { ExternalWalletConnectAccount } from "./external/ExternalWalletConnectAccount"
import { WalletConnectWCAccount } from "./wc/WalletConnectWCAccount"

type Props = {
  provider: string
  onSelect: (account: Account) => void
  currentAddress: string | undefined
  onClose: () => void
}

export const WalletConnectAccountSelect = ({
  provider,
  onSelect,
  currentAddress,
  onClose,
}: Props) => {
  const { t } = useTranslation()

  const isExternalWallet = provider === externalWallet.provider
  const isWalletConnect = provider === "WalletConnect"

  const accounts = useProviderAccounts(
    provider,
    !isExternalWallet && !isWalletConnect,
  )

  const accountComponents = accounts.data?.reduce((memo, account) => {
    const accountName = account.name ?? account.address
    // As Talisman allows Ethereum accounts to be added as well, filter these accounts out
    // as I believe these are not supported on Basilisk / HydraDX
    // @ts-expect-error
    if (account.type !== "ethereum" && account.type !== "ecdsa") {
      const isActive = currentAddress === account.address
      const accountComponent = (
        <WalletConnectAccountSelectItem
          isActive={isActive}
          provider={provider}
          key={account.address}
          name={accountName}
          address={account.address}
          onClick={() => {
            onSelect({
              name: accountName,
              address: account.address,
              provider,
              isExternalWalletConnected: false,
            })
          }}
        />
      )
      if (isActive) {
        memo.unshift(accountComponent)
      } else {
        memo.push(accountComponent)
      }
    }

    return memo
  }, [] as ReactNode[])

  return (
    <>
      <Text fw={400} color="basic400">
        {t("walletConnect.accountSelect.description")}
      </Text>

      <SContainer>
        {currentAddress && isExternalWallet ? (
          <ExternalWalletConnectAccount
            address={currentAddress}
            onClose={onClose}
          />
        ) : isWalletConnect ? (
          <WalletConnectWCAccount
            currentAddress={currentAddress}
            onSelect={onSelect}
          />
        ) : (
          accountComponents
        )}
      </SContainer>
    </>
  )
}
