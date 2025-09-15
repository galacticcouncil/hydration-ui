import { useNavigate, useSearch } from "@tanstack/react-location"
import { ComponentPropsWithoutRef, FC } from "react"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { SAccountItem } from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { pick } from "utils/rx"
import { useShallow } from "hooks/useShallow"
import { useSuiAccountBalance } from "api/external/sui"
import { shortenAccountAddress } from "utils/formatting"

export const Web3ConnectSuiAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = (account) => {
  const {
    account: currentAccount,
    setAccount,
    toggle,
  } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["account", "setAccount", "toggle"])),
  )
  const navigate = useNavigate()
  const search = useSearch<{ Search: { account?: string } }>()

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  const { data: balance } = useSuiAccountBalance(account?.displayAddress ?? "")

  return (
    <SAccountItem
      isActive={isActive}
      onClick={() => {
        setAccount(account)
        toggle()
        if (search.account) {
          navigate({ search: { account: undefined } })
        }
      }}
    >
      <Web3ConnectAccountSelect
        address={shortenAccountAddress(account.displayAddress ?? "", 24)}
        balance={balance?.amount}
        balanceDecimals={balance?.decimals}
        balanceSymbol={balance?.symbol}
        provider={account.provider}
        name={account.name}
        isActive={isActive}
      />
    </SAccountItem>
  )
}
