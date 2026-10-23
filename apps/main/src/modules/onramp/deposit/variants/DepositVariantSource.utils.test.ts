import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { describe, expect, it } from "vitest"

import { getPreferredDepositSourceAccount } from "./DepositVariantSource.utils"

const alice = {
  provider: WalletProviderType.Subwallet,
  address: "alice",
  publicKey: "alice-key",
}
const bob = { ...alice, address: "bob", publicKey: "bob-key" }
const evm = {
  provider: WalletProviderType.TalismanEvm,
  address: "evm",
  publicKey: "evm-key",
}

describe("default deposit source account", () => {
  it("prefers the active compatible account over older saved accounts", () => {
    expect(
      getPreferredDepositSourceAccount([alice, bob], bob, [], {
        [alice.provider]: alice.publicKey,
      }),
    ).toBe(bob)
  })

  it("restores the saved compatible account when the active account uses another network", () => {
    expect(
      getPreferredDepositSourceAccount([alice, bob], evm, [], {
        [bob.provider]: bob.publicKey,
      }),
    ).toBe(bob)
  })

  it("ranks saved accounts by the wallets' recent-use order", () => {
    expect(
      getPreferredDepositSourceAccount(
        [alice, evm],
        null,
        [evm.provider, alice.provider],
        {
          [alice.provider]: alice.publicKey,
          [evm.provider]: evm.publicKey,
        },
      ),
    ).toBe(evm)
  })

  it("does not substitute an unrelated account for a disconnected recent account", () => {
    expect(
      getPreferredDepositSourceAccount([alice], evm, [], {
        [bob.provider]: bob.publicKey,
      }),
    ).toBeUndefined()
  })

  it("leaves the choice empty when there is no active or saved compatible account", () => {
    expect(
      getPreferredDepositSourceAccount([alice], null, [], {}),
    ).toBeUndefined()
    expect(getPreferredDepositSourceAccount([], alice, [], {})).toBeUndefined()
  })
})
