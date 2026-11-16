import { isEthereumSigner } from "@galacticcouncil/web3-connect"
import type { EthereumSigner } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"

const H160_RE = /^0x[0-9a-fA-F]{40}$/

export type BankWalletGate =
  | { ok: true; h160: string; signer: EthereumSigner }
  | { ok: false; reason: "no_account" | "not_evm" | "account_mismatch" }

/**
 * Bank flows run only for an EVM account whose signer is an EthereumSigner
 * (API doc rule 15: sign-in is an EVM H160 with EIP-191). A Substrate signer
 * is refused even for an H160-derived account, and the H160 is the signer's
 * own address, never one converted from an SS58 address (that conversion
 * truncates a non-EVM AccountId32 to someone else's H160).
 */
export const getBankWalletGate = (
  account: { rawAddress: string } | null,
  signer: unknown,
): BankWalletGate => {
  if (!account) return { ok: false, reason: "no_account" }
  if (!isEthereumSigner(signer)) return { ok: false, reason: "not_evm" }
  const address = signer.address
  if (!H160_RE.test(address)) return { ok: false, reason: "not_evm" }
  if (address.toLowerCase() !== account.rawAddress.toLowerCase())
    return { ok: false, reason: "account_mismatch" }
  return { ok: true, h160: address.toLowerCase(), signer }
}
