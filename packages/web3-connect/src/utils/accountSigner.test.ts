import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import type { Account } from "@/hooks/useWeb3Connect"
import { EthereumSigner } from "@/signers/EthereumSigner"
import { getAccountSigner } from "@/utils/accountSigner"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

vi.mock("@/utils", () => ({ requestNetworkSwitch: vi.fn() }))

const alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const bob = safeConvertPublicKeyToSS58(`0x${"22".repeat(32)}`)
const receiverSigner = { publicKey: new Uint8Array([1]) }
const sourceSigner = { publicKey: new Uint8Array([2]) }
const wallet = new BaseSubstrateWallet()
const source = {
  address: bob,
  rawAddress: bob,
  provider: WalletProviderType.PolkadotJS,
} as Account

beforeEach(() => {
  wallet.provider = source.provider
  wallet._enabled = true
  wallet._signer = receiverSigner as typeof wallet._signer
  vi.spyOn(wallet, "getInjectedAccounts").mockReturnValue([
    { address: alice, polkadotSigner: receiverSigner },
    { address: bob, polkadotSigner: sourceSigner },
  ] as ReturnType<typeof wallet.getInjectedAccounts>)
})

describe("background deposit signer", () => {
  it("uses the selected source's actual injected signer without changing the wallet signer", () => {
    expect(getAccountSigner(wallet, source)).toBe(sourceSigner)
    expect(wallet.signer).toBe(receiverSigner)
  })
  it("rejects disconnected wallets, mismatched providers and accounts no longer shared", () => {
    wallet._enabled = false
    expect(getAccountSigner(wallet, source)).toBeUndefined()
    wallet._enabled = true
    expect(
      getAccountSigner(wallet, {
        ...source,
        provider: WalletProviderType.Subwallet,
      }),
    ).toBeUndefined()
    expect(
      getAccountSigner(wallet, {
        ...source,
        address: safeConvertPublicKeyToSS58(`0x${"33".repeat(32)}`),
      }),
    ).toBeUndefined()
    expect(wallet.signer).toBe(receiverSigner)
  })
  it("creates an EVM signer for the selected address without replacing the connector's signer", () => {
    const original = new EthereumSigner(`0x${"11".repeat(20)}`, {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    })
    const evmWallet = {
      ...wallet,
      enabled: true,
      installed: true,
      signer: original,
    }
    const account = { ...source, rawAddress: `0x${"22".repeat(20)}` }
    const signer = getAccountSigner(evmWallet, account)
    expect(signer).toBeInstanceOf(EthereumSigner)
    expect((signer as EthereumSigner).address).toBe(account.rawAddress)
    expect(original.address).toBe(`0x${"11".repeat(20)}`)
  })
})
