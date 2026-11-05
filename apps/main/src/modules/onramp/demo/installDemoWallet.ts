import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import {
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { Wallet } from "@galacticcouncil/web3-connect/src/types/wallet"
import { toStoredAccount } from "@galacticcouncil/web3-connect/src/utils/wallet"
import { getWallets } from "@galacticcouncil/web3-connect/src/wallets"

import { DEMO_WALLET_ENABLED } from "./demoWallet.config"

export const installDemoWallet = () => {
  if (!DEMO_WALLET_ENABLED) return
  const registry = getWallets()
  const demos = [
    {
      provider: WalletProviderType.PolkadotJS,
      title: "Demo Polkadot wallet",
      addresses: [
        safeConvertPublicKeyToSS58(
          "0xd1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1",
        ),
        safeConvertPublicKeyToSS58(
          "0xd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2",
        ),
      ],
    },
    {
      provider: WalletProviderType.MetaMask,
      title: "Demo EVM wallet",
      addresses: [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
      ],
    },
  ]
  const accounts = demos.flatMap(({ provider, title, addresses }) => {
    const original = registry.find((wallet) => wallet.provider === provider)!
    const accounts = addresses.map((address, index) => ({
      address,
      provider,
      name: `${title} ${index + 1}`,
    }))
    const wallet: Wallet = {
      provider,
      title,
      accessor: `demo-${provider}`,
      logo: original.logo,
      installUrl: "",
      installed: true,
      enabled: true,
      signer: undefined,
      enable: async () => {
        wallet.enabled = true
      },
      disconnect: () => {
        wallet.enabled = false
      },
      getAccounts: async () => accounts,
      subscribeAccounts: (callback) => {
        void callback(accounts)
        return () => {}
      },
      transformError: (error) => error,
    }
    registry.splice(registry.indexOf(original), 1, wallet)
    return accounts.map(toStoredAccount)
  })
  // Keep real wallet persistence intact; demo state has a separate storage key.
  useWeb3Connect.persist.setOptions({ name: "web3-connect-ramp-demo" })
  useWeb3Connect.setState({
    account: accounts[0],
    accounts,
    providers: demos.map(({ provider }) => ({
      type: provider,
      status: WalletProviderStatus.Connected,
    })),
    restoreStates: {},
    recentProvider: null,
    recentlyUsedProviders: [],
    open: false,
  })
}
