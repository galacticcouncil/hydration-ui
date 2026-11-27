import { describe, expect, it, vi } from "vitest"

import { getBankWalletGate } from "@/modules/onramp/bank/utils/walletGate"

// The real guard is `signer instanceof EthereumSigner`; stand in a class so
// the wallet package (and its app graph) is not loaded.
const fake = vi.hoisted(() => {
  class FakeEthereumSigner {
    constructor(public address: string) {}
  }
  return { FakeEthereumSigner }
})
vi.mock("@galacticcouncil/web3-connect", () => ({
  isEthereumSigner: (signer: unknown) =>
    signer instanceof fake.FakeEthereumSigner,
}))

const H160 = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"

// A PolkadotSigner's shape (isPolkadotSigner, web3-connect utils/signer.ts).
const polkadotSigner = {
  publicKey: new Uint8Array(32),
  signTx: () => undefined,
  signBytes: () => undefined,
}

describe("bank wallet gate", () => {
  it("refuses a Polkadot signer, even on an H160 account", () => {
    expect(getBankWalletGate({ rawAddress: H160 }, polkadotSigner)).toEqual({
      ok: false,
      reason: "not_evm",
    })
  })

  it("refuses a non-Ethereum signer that carries the account's H160 address", () => {
    const signer = { ...polkadotSigner, address: H160 }
    expect(getBankWalletGate({ rawAddress: H160 }, signer)).toEqual({
      ok: false,
      reason: "not_evm",
    })
  })

  it("refuses when no account is connected", () => {
    expect(getBankWalletGate(null, undefined)).toEqual({
      ok: false,
      reason: "no_account",
    })
  })

  it("takes the H160 from the EVM signer itself, lowercase", () => {
    const signer = new fake.FakeEthereumSigner(H160)
    const gate = getBankWalletGate({ rawAddress: H160 }, signer)
    expect(gate).toMatchObject({ ok: true, h160: H160.toLowerCase() })
  })

  it("refuses an EVM signer whose address is not the selected account", () => {
    const signer = new fake.FakeEthereumSigner(
      "0x0000000000000000000000000000000000000001",
    )
    expect(getBankWalletGate({ rawAddress: H160 }, signer)).toEqual({
      ok: false,
      reason: "account_mismatch",
    })
  })

  it("refuses an EVM signer whose address is not an H160", () => {
    const signer = new fake.FakeEthereumSigner(
      "7NsngNMt1JMh7ZoYt9AREBCrx8eYqDEA9n6c4sY8HRbBwbDq",
    )
    expect(
      getBankWalletGate({ rawAddress: signer.address }, signer),
    ).toMatchObject({ ok: false, reason: "not_evm" })
  })
})
