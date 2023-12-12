import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { SAccountsContainer } from "./Web3ConnectAccountList.styled"
import {
  WalletProviderType,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectEvmAccount } from "./Web3ConnectEvmAccount"
import { Web3ConnectExternalAccount } from "./Web3ConnectExternalAccount"
import { Web3ConnectSubstrateAccount } from "./Web3ConnectSubstrateAccount"
import { MetaMask } from "sections/web3-connect/wallets/MetaMask"

const getAccountComponentByType = (type: WalletProviderType | null) => {
  switch (type) {
    case WalletProviderType.ExternalWallet:
      return Web3ConnectExternalAccount
    case WalletProviderType.MetaMask:
      return Web3ConnectEvmAccount
    default:
      return Web3ConnectSubstrateAccount
  }
}

export const Web3ConnectAccountList: FC<{
  accounts?: Account[]
}> = ({ accounts = [] }) => {
  const { t } = useTranslation()

  const { type, wallet } = useWallet()

  const AccountComponent = getAccountComponentByType(type)

  // show only main account for metamask
  const filteredAccounts =
    wallet instanceof MetaMask ? accounts.slice(0, 1) : accounts

  return (
    <>
      <Text fw={400} color="basic400">
        {t("walletConnect.accountSelect.description")}
      </Text>
      <SAccountsContainer>
        {filteredAccounts?.map((account) => (
          <AccountComponent key={account.address} {...account} />
        ))}
      </SAccountsContainer>
    </>
  )
}
