import { useNavigate, useSearch } from "@tanstack/react-location"
import { useEthereumAccountBalance } from "api/external/ethereum"
import { useShallow } from "hooks/useShallow"
import { ComponentPropsWithoutRef, FC } from "react"
import { useTranslation } from "react-i18next"
import { useConnectedProvider } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import {
  SAccountItem,
  SChangeAccountButton,
} from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import {
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { H160 } from "utils/evm"
import { isMetaMask, isMetaMaskLike, requestAccounts } from "utils/metamask"
import { pick } from "utils/rx"

export const Web3ConnectEvmAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const { t } = useTranslation()
  const {
    account: currentAccount,
    setAccount,
    toggle,
    mode,
    meta,
  } = useWeb3ConnectStore(
    useShallow((state) =>
      pick(state, ["account", "setAccount", "toggle", "mode", "meta"]),
    ),
  )

  const { wallet } = useConnectedProvider(account.provider)
  const navigate = useNavigate()
  const search = useSearch<{ Search: { account?: string } }>()

  const isEthereum = mode === WalletMode.EVM && meta?.chain === "ethereum"

  const { data: nativeBalance } = useEthereumAccountBalance(
    H160.fromAccount(account.address),
    {
      enabled: isEthereum,
    },
  )

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  // Allow account changing for MetaMask wallets,
  // but disable for MetaMask-like as it doesn't provide a way to open the account selection programmatically
  const shouldAllowAccountChange =
    isActive &&
    isMetaMask(wallet?.extension) &&
    !isMetaMaskLike(wallet?.extension)

  return (
    <div>
      <SAccountItem
        isActive={isActive}
        withButton={shouldAllowAccountChange}
        onClick={() => {
          setAccount(account)
          toggle()
          if (search.account) {
            navigate({ search: { account: undefined } })
          }
        }}
      >
        <Web3ConnectAccountSelect
          address={account.displayAddress ?? ""}
          balance={isEthereum ? nativeBalance?.amount : balance}
          balanceDecimals={isEthereum ? nativeBalance?.decimals : undefined}
          balanceSymbol={isEthereum ? nativeBalance?.symbol : undefined}
          provider={account.provider}
          name={account.name}
          isActive={isActive}
        />
      </SAccountItem>
      {shouldAllowAccountChange && (
        <SChangeAccountButton
          variant="outline"
          fullWidth
          size="small"
          onClick={() => requestAccounts(wallet?.extension)}
        >
          {t("walletConnect.accountSelect.change")}
        </SChangeAccountButton>
      )}
    </div>
  )
}
