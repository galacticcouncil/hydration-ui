import { type AppKit, createAppKit } from "@reown/appkit"

import { REOWN_PROJECT_ID } from "@/config/wallet"

import { EVM_NETWORKS, hydration, SUBSTRATE_NETWORKS } from "./networks"

export class AppKitSingleton {
  private static instance: AppKit | undefined

  static getInstance(): AppKit {
    if (!AppKitSingleton.instance) {
      AppKitSingleton.instance = createAppKit({
        projectId: REOWN_PROJECT_ID,
        networks: [hydration, ...SUBSTRATE_NETWORKS, ...EVM_NETWORKS],
        universalProviderConfigOverride: {
          methods: {
            polkadot: ["polkadot_signTransaction", "polkadot_signMessage"],
          },
        },
        showWallets: false,
        allWallets: "HIDE",
      })
    }
    return AppKitSingleton.instance
  }
}
