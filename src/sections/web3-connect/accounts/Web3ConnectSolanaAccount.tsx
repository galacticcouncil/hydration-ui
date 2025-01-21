import { useLocation, useNavigate } from "@tanstack/react-location"
import { useSolanaAccountBalance } from "api/external/solana"
import { ComponentPropsWithoutRef, FC } from "react"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { SAccountItem } from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { pick } from "utils/rx"
import { useShallow } from "hooks/useShallow"

export const Web3ConnectSolanaAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = (account) => {
  const {
    account: currentAccount,
    setAccount,
    toggle,
  } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["account", "setAccount", "toggle"])),
  )
  const { parseSearch } = useLocation()
  const navigate = useNavigate()

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  const { data: balance } = useSolanaAccountBalance(
    account?.displayAddress ?? "",
  )

  return (
    <div>
      <SAccountItem
        isActive={isActive}
        onClick={() => {
          setAccount(account)
          toggle()
          if (parseSearch(window.location.search)?.account) {
            navigate({ search: { account: undefined } })
          }
        }}
      >
        <Web3ConnectAccountSelect
          address={account.displayAddress ?? ""}
          balance={balance?.amount}
          balanceDecimals={balance?.decimals}
          balanceSymbol={balance?.symbol}
          provider={account.provider}
          name={account.name}
          isActive={isActive}
        />
      </SAccountItem>
    </div>
  )
}
