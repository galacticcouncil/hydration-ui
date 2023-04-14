import {
  PROXY_WALLET_PROVIDER,
  externalWallet,
  useAccountStore,
} from "state/store"
import { WalletConnectAccountSelectItem } from "../item/WalletConnectAccountSelectItem"
import { useQuery } from "@tanstack/react-query"
import {
  HYDRA_ADDRESS_PREFIX,
  POLKADOT_APP_NAME,
  useApiPromise,
} from "utils/api"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { getWalletBySource } from "@talismn/connect-wallets"
import {
  SLeaf,
  SLine,
  SContainer,
  SGroupContainer,
} from "./ExternalWalletConnectAccount.styled"

export const ExternalWalletConnectAccount = ({
  address,
}: {
  address: string
}) => {
  const api = useApiPromise()
  const { account, setAccount } = useAccountStore()
  const isHydraAddress = address[0] === "7"
  const hydraAddress = isHydraAddress
    ? address
    : encodeAddress(decodeAddress(address), HYDRA_ADDRESS_PREFIX)

  const externalWalletData = useQuery(
    ["externalWallet", hydraAddress],
    async () => {
      const proxies = await api.query.proxy.proxies(hydraAddress)
      const delegates = proxies[0].map((proxy) => proxy.delegate)

      return { isProxy: !!delegates.length, delegates }
    },
  )

  const accounts = useQuery(
    ["polkadotAccounts"],
    async () => {
      const wallet = getWalletBySource(PROXY_WALLET_PROVIDER)

      await wallet?.enable(POLKADOT_APP_NAME)

      return await wallet?.getAccounts()
    },
    { enabled: externalWalletData.data?.isProxy },
  )

  const filteredAccounts =
    accounts.data?.filter((myAccount) =>
      externalWalletData.data?.delegates.find(
        (delegate) =>
          delegate.toString() ===
          encodeAddress(decodeAddress(myAccount.address), HYDRA_ADDRESS_PREFIX),
      ),
    ) ?? []

  if (!account) return null

  if (!externalWalletData.data?.isProxy) {
    return (
      <WalletConnectAccountSelectItem
        isActive
        provider={externalWallet.provider}
        name={externalWallet.name}
        address={hydraAddress}
      />
    )
  }

  return (
    <div sx={{ ml: 5 }}>
      <SContainer>
        <SLine />
        <WalletConnectAccountSelectItem
          isActive
          provider={externalWallet.provider}
          name={externalWallet.name}
          address={hydraAddress}
          isProxy
        />
      </SContainer>
      <SGroupContainer>
        {filteredAccounts.map((delegate) => {
          const address = encodeAddress(
            decodeAddress(delegate.address),
            HYDRA_ADDRESS_PREFIX,
          )
          return (
            <SContainer key={address}>
              <SLeaf />
              <WalletConnectAccountSelectItem
                isActive={address === account?.delegate}
                provider={PROXY_WALLET_PROVIDER}
                name={delegate.name ?? "N/A"}
                address={address}
                setAccount={() => {
                  setAccount({
                    ...account,
                    delegate: address,
                  })
                }}
              />
            </SContainer>
          )
        })}
      </SGroupContainer>
    </div>
  )
}
