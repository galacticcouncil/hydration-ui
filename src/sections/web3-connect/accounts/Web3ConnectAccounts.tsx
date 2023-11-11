import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { SAccountsContainer } from "./Web3ConnectAccounts.styled"
import { Web3ConnectEvmAccount } from "sections/web3-connect/accounts/Web3ConnectEvmAccount"
import { useWallet } from "sections/web3-connect/Web3Connect.utils"

export const Web3ConnectAccounts: FC<{
  accounts?: Account[]
}> = ({ accounts = [] }) => {
  const { t } = useTranslation()

  const { type } = useWallet()

  if (type === "metamask") {
    return (
      <SAccountsContainer>
        {accounts?.map((account) => (
          <Web3ConnectEvmAccount key={account.address} {...account} />
        ))}
      </SAccountsContainer>
    )
  }

  return (
    <>
      <Text fw={400} color="basic400">
        {t("walletConnect.accountSelect.description")}
      </Text>
      <SAccountsContainer>
        {accounts?.map((account) => (
          <Web3ConnectAccount key={account.address} {...account} />
        ))}
      </SAccountsContainer>
    </>
  )
}
