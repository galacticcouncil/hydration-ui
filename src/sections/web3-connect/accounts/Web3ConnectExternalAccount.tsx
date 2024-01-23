import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { useExternalWalletDelegates } from "api/proxies"
import { useShallow } from "hooks/useShallow"
import { ComponentPropsWithoutRef, FC, useEffect } from "react"
import {
  getWalletProviderByType,
  useWalletAccounts,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletProviderType } from "sections/web3-connect/wallets"
import { ExternalWallet } from "sections/web3-connect/wallets/ExternalWallet"
import { HYDRA_ADDRESS_PREFIX, POLKADOT_APP_NAME } from "utils/api"
import { getAddressVariants } from "utils/formatting"
import { pick } from "utils/rx"
import {
  SContainer,
  SGroupContainer,
  SLeaf,
  SLine,
} from "./Web3ConnectExternalAccount.styled"
import { H160, isEvmAccount } from "utils/evm"
import { Web3ConnectEvmAccount } from "sections/web3-connect/accounts/Web3ConnectEvmAccount"

export const Web3ConnectExternalAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const {
    setAccount,
    toggle,
    account: selectedAccount,
  } = useWeb3ConnectStore(
    useShallow((s) => pick(s, ["setAccount", "toggle", "account"])),
  )

  const { address, provider } = account
  const { wallet } = getWalletProviderByType(provider)

  const externalWallet = wallet instanceof ExternalWallet ? wallet : null
  const externalWalletAddress = externalWallet?.account?.address ?? ""

  const { hydraAddress } = getAddressVariants(address)

  const { data: externalWalletData } = useExternalWalletDelegates(
    externalWalletAddress,
  )

  const isProxy = externalWalletData?.isProxy ?? false
  const delegates = externalWalletData?.delegates ?? []

  useEffect(() => {
    if (isProxy && externalWallet) {
      const { wallet: proxyWallet } = getWalletProviderByType(
        externalWallet.proxyWalletProvider,
      )

      if (proxyWallet?.installed && !proxyWallet?.extension) {
        proxyWallet?.enable(POLKADOT_APP_NAME)
      }
    }
  }, [externalWallet, isProxy])

  const { data: accounts } = useWalletAccounts(
    externalWallet?.proxyWalletProvider ?? null,
    {
      enabled: isProxy,
    },
  )

  const filteredAccounts =
    accounts?.filter((account) =>
      delegates.find((delegate) => {
        return (
          delegate.toString() ===
          encodeAddress(decodeAddress(account.address), HYDRA_ADDRESS_PREFIX)
        )
      }),
    ) ?? []

  if (!account) return null
  if (!externalWallet) return null

  if (!isProxy || (isProxy && !filteredAccounts.length)) {
    if (isEvmAccount(address)) {
      return (
        <Web3ConnectEvmAccount
          provider={WalletProviderType.ExternalWallet}
          name={externalWallet.accountName}
          address={address}
          displayAddress={H160.fromAccount(address)}
          balance={balance}
          onClick={() => toggle()}
        />
      )
    }
    return (
      <Web3ConnectAccount
        isActive
        provider={WalletProviderType.ExternalWallet}
        name={externalWallet.accountName}
        address={address}
        displayAddress={hydraAddress}
        balance={balance}
        onClick={() => toggle()}
      />
    )
  }

  return (
    <div sx={{ ml: 5 }}>
      <SContainer>
        <SLine />
        <Web3ConnectAccount
          isActive
          provider={WalletProviderType.ExternalWallet}
          name={externalWallet.proxyAccountName}
          address={address}
          displayAddress={hydraAddress}
          balance={balance}
          isProxy
        />
      </SContainer>
      <SGroupContainer>
        {filteredAccounts.map(({ address, name }) => {
          return (
            <SContainer key={address}>
              <SLeaf />
              <Web3ConnectAccount
                isActive={address === selectedAccount?.delegate}
                provider={externalWallet?.proxyWalletProvider}
                name={name ?? "N/A"}
                address={address}
                onClick={async () => {
                  setAccount({
                    ...account,
                    name: externalWallet.proxyAccountName,
                    delegate: address,
                  })
                  await externalWallet?.enableProxy(POLKADOT_APP_NAME)
                  toggle()
                }}
              />
            </SContainer>
          )
        })}
      </SGroupContainer>
    </div>
  )
}
