// Phase 5b — derive a RAILGUN wallet from a one-shot EVM signature.
//
// Flow:
//   1. user clicks "Sign in to RAILGUN"
//   2. we request a signMessage of a fixed string against their connected
//      EVM wallet (MetaMask / Talisman EVM / WalletConnect — whatever
//      hydration-ui already exposes via useWallet().wallet.extension)
//   3. sha256(signature) → first 16 bytes → BIP-39 entropy → 12-word mnemonic
//   4. engine.createWalletFromMnemonic(encryptionKey, mnemonic) → walletId
//   5. persist walletId to localStorage so refreshes don't require a re-sign
//
// Why an EVM signature instead of a separate password: the user already
// authenticates with this key for every regular swap. Reusing it makes the
// shielded wallet stateless across devices (sign with the same EVM key on a
// new device → recover the same 0zk… address) at the cost of binding the
// spending key to whoever can forge the EVM signature. Acceptable for
// devnet/MVP. See "Mnemonic-from-EVM-signature UX" risk in the Phase 5 plan.

import { useCallback, useEffect, useState } from "react"
import { Mnemonic, RailgunEngine } from "@railgun-community/engine"
import { sha256 } from "@noble/hashes/sha2"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"

import { useEvmAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { isEvmWalletExtension } from "utils/evm"
import { ACTIVE_RAILGUN_CHAIN } from "sections/privacy/utils/networks"

const SIGN_IN_MESSAGE = "Sign in to RAILGUN on Hydration · v1"

// Same encryption key for every wallet on the chain. The "encryption" here
// guards the wallet blob inside the engine DB; since we re-derive it from a
// fresh signature each session, a static key adds no security but the engine
// API requires one (must be 64-char hex).
//
// Exported so downstream flows (SendFlow et al) can hand it to engine APIs
// that decrypt the wallet's spending key in order to sign proofs
// (TransactionBatch.generateTransactions). Internal-but-importable — nothing
// outside `sections/privacy` should reach for this.
export const RAILGUN_ENCRYPTION_KEY =
  "0101010101010101010101010101010101010101010101010101010101010101"
const ENCRYPTION_KEY = RAILGUN_ENCRYPTION_KEY

const walletIdStorageKey = (evmAddress: string, chainId: number) =>
  `railgun.walletId.${chainId}.${evmAddress.toLowerCase()}`

export type RailgunWalletState =
  | { status: "no-account" }
  | { status: "ready-to-sign"; sign: () => Promise<void> }
  | { status: "signing" }
  | { status: "creating-wallet" }
  | { status: "ready"; walletId: string; railgunAddress: string }
  | { status: "error"; error: Error; retry: () => Promise<void> }

type UseRailgunWalletArgs = {
  engine: RailgunEngine | null
}

export const useRailgunWallet = ({
  engine,
}: UseRailgunWalletArgs): RailgunWalletState => {
  const { account } = useEvmAccount()
  const { wallet } = useWallet()
  const [state, setState] = useState<RailgunWalletState>({ status: "no-account" })

  const evmAddress = account?.address ?? ""
  const extension = wallet?.extension

  const createWalletFromSignature = useCallback(
    async (signatureHex: string) => {
      if (!engine) throw new Error("RAILGUN engine not booted yet")

      // sha256(signature) → 32 bytes. Take first 16 (128-bit BIP-39 entropy).
      const sigBytes = hexToBytes(signatureHex.replace(/^0x/, "") as string)
      const digest = sha256(sigBytes)
      const entropyHex = bytesToHex(digest.slice(0, 16))

      const mnemonic = Mnemonic.fromEntropy(entropyHex)
      const wallet = await engine.createWalletFromMnemonic(
        ENCRYPTION_KEY,
        mnemonic,
      )
      return { walletId: wallet.id, railgunAddress: wallet.getAddress() }
    },
    [engine],
  )

  const sign = useCallback(async () => {
    if (!evmAddress || !extension || !isEvmWalletExtension(extension)) {
      setState({
        status: "error",
        error: new Error("EVM wallet not connected"),
        retry: sign,
      })
      return
    }
    if (!engine) {
      setState({
        status: "error",
        error: new Error("RAILGUN engine not ready"),
        retry: sign,
      })
      return
    }

    try {
      setState({ status: "signing" })
      // personal_sign — returns 0x-prefixed hex signature.
      const signature = (await extension.request({
        method: "personal_sign",
        params: [SIGN_IN_MESSAGE, evmAddress],
      })) as string

      setState({ status: "creating-wallet" })
      const { walletId, railgunAddress } =
        await createWalletFromSignature(signature)

      localStorage.setItem(
        walletIdStorageKey(evmAddress, ACTIVE_RAILGUN_CHAIN.chainId),
        walletId,
      )
      setState({ status: "ready", walletId, railgunAddress })
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setState({ status: "error", error: err, retry: sign })
    }
  }, [engine, evmAddress, extension, createWalletFromSignature])

  // Try to re-attach an existing wallet from localStorage (loadExistingWallet
  // is keyed by the engine's internal id, persisted to its IndexedDB store).
  useEffect(() => {
    if (!engine) return
    if (!evmAddress) {
      setState({ status: "no-account" })
      return
    }
    const persistedId = localStorage.getItem(
      walletIdStorageKey(evmAddress, ACTIVE_RAILGUN_CHAIN.chainId),
    )
    if (!persistedId) {
      setState({ status: "ready-to-sign", sign })
      return
    }
    let cancelled = false
    engine
      .loadExistingWallet(ENCRYPTION_KEY, persistedId)
      .then((wallet) => {
        if (cancelled) return
        setState({
          status: "ready",
          walletId: wallet.id,
          railgunAddress: wallet.getAddress(),
        })
      })
      .catch(() => {
        if (cancelled) return
        // Wallet blob missing (cleared storage, new browser, etc.) — fall
        // back to sign-in.
        localStorage.removeItem(
          walletIdStorageKey(evmAddress, ACTIVE_RAILGUN_CHAIN.chainId),
        )
        setState({ status: "ready-to-sign", sign })
      })
    return () => {
      cancelled = true
    }
  }, [engine, evmAddress, sign])

  return state
}
