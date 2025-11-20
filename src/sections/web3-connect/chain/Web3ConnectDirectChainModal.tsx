import { useMutation } from "@tanstack/react-query"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SAccountItem } from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { Web3ConnectProviderIcon } from "sections/web3-connect/providers/Web3ConnectProviderIcon"
import { useWalletProviders } from "sections/web3-connect/providers/Web3ConnectProviders"
import {
  SProviderButton,
  SProviderContainer,
} from "sections/web3-connect/providers/Web3ConnectProviders.styled"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletAccount } from "sections/web3-connect/types"
import { WalletProvider } from "sections/web3-connect/Web3Connect.utils"
import { POLKADOT_APP_NAME } from "utils/api"
import { shortenAccountAddress } from "utils/formatting"

export type RedeemMode = "deposit" | "withdraw"

const WalletProviderButton = ({
  provider,
  onEnable,
}: {
  provider: WalletProvider
  onEnable: (accounts: WalletAccount[]) => void
}) => {
  const { mutate: enable } = useMutation(async () => {
    await provider.wallet.enable(POLKADOT_APP_NAME)
    const accounts = await provider.wallet.getAccounts()
    onEnable(accounts)
  })

  return (
    <SProviderButton onClick={() => enable()}>
      <Web3ConnectProviderIcon type={provider.type} />
      <Text fs={[12, 13]} sx={{ mt: 8 }} tAlign="center">
        {provider.wallet.title}
      </Text>
    </SProviderButton>
  )
}

export const Web3ConnectDirectChainModal = ({
  onAccountSelect,
  open,
  onClose,
  walletMode,
}: {
  onAccountSelect: (account: WalletAccount) => void
  open: boolean
  onClose: () => void
  walletMode: WalletMode
}) => {
  const { t } = useTranslation()
  const { installedProviders } = useWalletProviders(walletMode)
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([])

  const { page, direction, paginateTo } = useModalPagination(0)

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={onClose}
        contents={[
          {
            title: t("walletConnect.provider.title").toUpperCase(),
            description: t("walletConnect.provider.description.default"),
            headerVariant: "gradient",
            content: (
              <SProviderContainer>
                {installedProviders.map((provider) => (
                  <WalletProviderButton
                    key={provider.type}
                    provider={provider}
                    onEnable={(accounts) => {
                      console.log({ accounts })
                      setWalletAccounts(accounts)
                      paginateTo(1)
                    }}
                  />
                ))}
              </SProviderContainer>
            ),
          },
          {
            title: t("walletConnect.accountSelect.title").toUpperCase(),
            description: t("walletConnect.accountSelect.description"),
            headerVariant: "gradient",
            content: (
              <>
                {walletAccounts.map((account) => (
                  <SAccountItem
                    key={account.address}
                    onClick={() => onAccountSelect(account)}
                  >
                    <Web3ConnectAccountSelect
                      address={account.address}
                      name={
                        account?.name ?? shortenAccountAddress(account.address)
                      }
                      genesisHash={account.genesisHash}
                      hideBalance
                    />
                  </SAccountItem>
                ))}
              </>
            ),
          },
        ]}
      />
    </Modal>
  )
}
