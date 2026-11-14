import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import {
  HYDRATION_CHAIN_KEY,
  isAnyEvmChain,
  wsToHttp,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { isObjectType } from "remeda"
import {
  Address,
  BaseError,
  createPublicClient,
  createWalletClient,
  custom,
  EIP1193Provider,
  EstimateGasParameters,
  ExecutionRevertedError,
  getContract,
  Hex,
  hexToBigInt,
  http,
  numberToHex,
  parseSignature,
  PublicClient,
  stringToHex,
  TransactionReceipt,
  WalletClient,
} from "viem"

import {
  EVM_CALL_PERMIT_ABI,
  EVM_CALL_PERMIT_ADDRESS,
  EVM_CALL_PERMIT_TYPES,
  EVM_DEFAULT_CHAIN_KEY,
  EVM_DISPATCH_ADDRESS,
} from "@/config/evm"
import { requestNetworkSwitch } from "@/utils"
import { EIP1193_USER_REJECTED, getEip1193ErrorCode } from "@/utils/ethereum"
import {
  getPermitGasFromWeight,
  getPermitGasLimit,
  getPermitGasPrice,
} from "@/utils/permitGas"

type PermitMessage = {
  from: string
  to: string
  value: number
  data: string
  gaslimit: number
  nonce: number
  deadline: number
}

export type PermitResult = {
  signature: ReturnType<typeof parseSignature>
  message: PermitMessage
}

type TransactionCall = Omit<ExtendedEvmCall, "from" | "type" | "dryRun">

type EthereumSignerOptions = {
  chainKey?: string
  weight?: bigint
  priorityRpcUrl?: string
  nonce?: number
  onSubmitted: (txHash: string) => void
  onSuccess: (receipt: TransactionReceipt) => void
  onError: (error: string) => void
  onFinalized: (receipt: TransactionReceipt) => void
}

/**
 * A transaction a server prepared for this wallet. `sendPreparedTransaction`
 * sends `to`, `data`, `value` and `chainId` exactly as given.
 */
export type PreparedEvmTransaction = {
  chainId: number
  from: string
  to: string
  data: string
  value: string
}

/** Why a prepared transaction was refused before `eth_sendTransaction`. */
export type PreparedSendRefusal =
  | "account"
  | "chain"
  | "read_chain"
  | "estimate"

export type PreparedReceiptStatus = "success" | "reverted" | "unknown"

/**
 * - `refused`: refused before `eth_sendTransaction`; nothing reached the wallet's send.
 * - `rejected`: the provider's own error carried code 4001 and no hash came back.
 * - `failed`: `eth_sendTransaction` failed otherwise, or answered no readable hash;
 *   the wallet may have broadcast.
 * - `sent`: a hash came back; `receipt` is what the receipt wait observed.
 */
export type PreparedSendOutcome =
  | { kind: "refused"; reason: PreparedSendRefusal }
  | { kind: "rejected" }
  | { kind: "failed"; code: number | null; hash?: Hex }
  | { kind: "sent"; hash: Hex; receipt: PreparedReceiptStatus }

export type PreparedSendOptions = {
  priorityRpcUrl?: string
  /** Called right before `eth_sendTransaction`, the one wallet send of this call. */
  onPrompt: () => void
  /** Called before the matching onSuccess/onError, also for the finality re-report. */
  onReceipt: (status: PreparedReceiptStatus) => void
  /**
   * The wallet sped the transaction up (viem reason `repriced`: same call,
   * new hash). Its receipt is then the replacement's. A cancel or another
   * replacement is not followed: it reads `unknown`.
   */
  onRepriced: (txHash: string) => void
  /**
   * The hash whose receipt is MINED (success or reverted): the final hash after
   * a speed-up, once. Never for a cancelled or replaced transaction, one whose
   * receipt was not observed, or a hash that never mines. Also for a hash a
   * failed send's error surfaced, once that hash's receipt is seen.
   */
  onMined: (txHash: string, status: "success" | "reverted") => void
  onSubmitted: (txHash: string) => void
  onSuccess: (receipt: TransactionReceipt) => void
  onError: (error: string) => void
  onFinalized: (receipt: TransactionReceipt) => void
}

// Fixed messages: a provider's own message can echo the request, calldata
// included, and onError text reaches toasts that are persisted.
export const PREPARED_SEND_ERRORS = {
  refused: "Prepared transaction refused before sending",
  rejected: "User rejected the request.",
  failed: "Prepared transaction: the wallet did not confirm a send",
  receipt: "Prepared transaction: receipt not observed",
} as const

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/
const TX_HASH_IN_TEXT_RE = /0x[0-9a-fA-F]{64}(?![0-9a-fA-F])/
// Only these keys name a TRANSACTION hash (viem receipts and transactions use
// `hash`/`transactionHash`; wallets surface `txHash`). Never `blockHash`,
// `parentHash` or another *hash: a false report pins the ramp to a hash that
// never mines.
const TX_HASH_KEYS: ReadonlySet<string> = new Set([
  "hash",
  "txHash",
  "transactionHash",
])

/**
 * Hash-shaped values inside a thrown provider error (own enumerable props plus
 * `message`, `data` and `cause`, which a real Error keeps non-enumerable;
 * depth 4). `any` is true for any 0x+64-hex string anywhere: enough to refuse
 * "no hash returned" (the safe direction, even for a block hash or a request
 * id). `keyed` is the first one under an exact transaction-hash key: the only
 * one ever watched for a receipt and reported.
 */
const findHashes = (value: unknown): { any: boolean; keyed: Hex | null } => {
  let any = false
  let keyed: Hex | null = null
  const seen = new Set<unknown>()
  const walk = (v: unknown, key: string, depth: number) => {
    if (typeof v === "string") {
      if (TX_HASH_IN_TEXT_RE.test(v)) {
        any = true
        if (!keyed && TX_HASH_KEYS.has(key) && TX_HASH_RE.test(v))
          keyed = v as Hex
      }
      return
    }
    if (depth > 4 || typeof v !== "object" || v === null || seen.has(v)) return
    seen.add(v)
    const keys = new Set([...Object.keys(v), "message", "data", "cause"])
    for (const k of keys) {
      let child: unknown
      try {
        child = (v as Record<string, unknown>)[k]
      } catch {
        continue
      }
      walk(child, k, depth + 1)
    }
  }
  walk(value, "", 0)
  return { any, keyed }
}

export class EthereumSigner {
  address: string
  provider: EIP1193Provider
  publicClient: PublicClient
  walletClient: WalletClient

  constructor(address: string, provider: EIP1193Provider) {
    this.address = address
    this.provider = provider

    this.publicClient = createPublicClient({
      transport: custom(provider),
    })

    this.walletClient = createWalletClient({
      transport: custom(provider),
    })
  }

  formatError = (err: unknown): string => {
    if (err instanceof BaseError)
      return `${err.name}: ${err.details || err.shortMessage}`
    if (err instanceof Error) return err.message
    return "Unknown error"
  }

  /**
   * EIP-191 `personal_sign` of `message` exactly as given: its UTF-8 bytes,
   * hex-encoded so no wallet reads it as hex or trims it. Calls the provider
   * directly and rethrows its own error untouched, so the caller can read the
   * EIP-1193 `code` (4001 = the user rejected) with `getEip1193ErrorCode`.
   */
  async signMessage(message: string): Promise<Hex> {
    const signature = await this.provider.request({
      method: "personal_sign",
      params: [stringToHex(message), this.address as Address],
    })
    return signature as Hex
  }

  async getGas(
    tx: EstimateGasParameters,
    weight: bigint = 0n,
  ): Promise<bigint> {
    const isPrecompileTx = tx.to === EVM_DISPATCH_ADDRESS

    if (isPrecompileTx && weight > 0n) {
      return getPermitGasFromWeight(weight)
    }

    return this.publicClient.estimateGas({
      ...tx,
      account: this.address as Address,
    })
  }

  async estimateGas(tx: EstimateGasParameters, weight: bigint = 0n) {
    const [gas, gasPriceBase] = await Promise.all([
      this.getGas(tx, weight),
      this.publicClient.getGasPrice(),
    ])
    const gasPrice = getPermitGasPrice(gasPriceBase)
    const gasLimit = getPermitGasLimit(gas, weight)

    return {
      gas,
      gasLimit,
      gasPrice,
      maxPriorityFeePerGas: gasPrice,
      maxFeePerGas: gasPrice,
    }
  }

  switchChain = async (options: EthereumSignerOptions) => {
    const chainKey = options.chainKey ?? EVM_DEFAULT_CHAIN_KEY
    const chain = chainsMap.get(chainKey)

    const isEvmChain = !!chain && isAnyEvmChain(chain)

    if (!isEvmChain) throw new Error(`Chain ${chainKey} is not an EVM chain`)

    const { evmClient } = chain

    await requestNetworkSwitch(this.provider, {
      chain: chainKey,
      priorityRpcUrl: options.priorityRpcUrl,
    })

    // A selected fork may share the mainnet chain ID. Rebuild the read client
    // for the selected endpoint so gas, nonce and receipt reads stay on it.
    this.publicClient = options.priorityRpcUrl
      ? (createPublicClient({
          chain: evmClient.chain,
          transport: http(wsToHttp(options.priorityRpcUrl)),
        }) as PublicClient)
      : (evmClient.getProvider() as PublicClient)

    await this.walletClient.switchChain({ id: evmClient.chain.id })

    return chain
  }

  async signAndSubmitDispatch(
    call: Omit<TransactionCall, "to">,
    options: EthereumSignerOptions,
  ) {
    return this.signAndSubmit(
      {
        ...call,
        to: EVM_DISPATCH_ADDRESS,
      },
      options,
    )
  }

  getPermitNonce = async (): Promise<number> => {
    const callPermitContract = getContract({
      address: EVM_CALL_PERMIT_ADDRESS,
      abi: EVM_CALL_PERMIT_ABI,
      client: this.publicClient,
    })

    const nonce = await callPermitContract.read.nonces([this.address as Hex])

    return Number(nonce)
  }

  getPermit = async (
    call: string | ExtendedEvmCall,
    options: EthereumSignerOptions,
  ): Promise<PermitResult> => {
    if (this.provider && this.address) {
      try {
        await this.switchChain(options)

        const weight = options.weight ?? 0n

        const isExtendedEvmCall = isObjectType(call)
        const tx = isExtendedEvmCall
          ? {
              from: call.from as Address,
              to: call.to as Hex,
              data: call.data as Hex,
            }
          : {
              from: this.address as Address,
              to: EVM_DISPATCH_ADDRESS as Hex,
              data: call as Hex,
            }

        const [latestBlock, chainId] = await Promise.all([
          this.publicClient.getBlock(),
          this.publicClient.getChainId(),
        ])

        const gasLimit =
          isExtendedEvmCall && call.gasLimit
            ? call.gasLimit
            : (await this.estimateGas(tx, weight)).gasLimit
        const nonce = options?.nonce ?? (await this.getPermitNonce())

        const createPermitMessageData = () => {
          const message: PermitMessage = {
            ...tx,
            value: 0,
            gaslimit: Number(gasLimit),
            nonce,
            deadline: Number(latestBlock.timestamp) + 3600, // 1 hour deadline,
          }

          const typedData = JSON.stringify({
            types: EVM_CALL_PERMIT_TYPES,
            primaryType: "CallPermit",
            domain: {
              name: "Call Permit Precompile",
              version: "1",
              chainId,
              verifyingContract: EVM_CALL_PERMIT_ADDRESS,
            },
            message: message,
          })

          return {
            typedData,
            message,
          }
        }

        const { message, typedData } = createPermitMessageData()

        const result = await this.walletClient.request({
          method: "eth_signTypedData_v4",
          params: [this.address as Address, typedData],
        })
        const signature = parseSignature(result)

        return {
          message,
          signature,
        }
      } catch (err) {
        options.onError(this.formatError(err))
        throw err
      }
    }

    throw new Error("Error signing transaction. Provider not found")
  }

  async signAndSubmitHydration(
    call: TransactionCall,
    options: EthereumSignerOptions,
  ) {
    try {
      const [gas, nonce] = await Promise.all([
        this.estimateGas(
          {
            data: call.data as Hex,
            to: call.to,
          },
          options.weight,
        ),
        this.publicClient.getTransactionCount({
          address: this.address as Hex,
        }),
      ])

      const txHash = await this.walletClient.sendTransaction({
        account: this.address as Hex,
        data: call.data as Hex,
        to: call.to,
        nonce: options?.nonce ?? nonce,
        chain: this.publicClient.chain,
        maxFeePerGas: call?.maxFeePerGas || gas.maxFeePerGas,
        maxPriorityFeePerGas:
          call?.maxPriorityFeePerGas || gas.maxPriorityFeePerGas,
        gas: call?.gasLimit || gas.gasLimit,
        value: call?.value,
      })

      options.onSubmitted(txHash)

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      })
      this.reportReceipt(receipt, options)

      // The receipt comes from the best block, which a reorg can replace and
      // re-execute: report again once its block is finalized. Not awaited, so
      // callers still settle on the first receipt.
      void this.waitForFinalReceipt(txHash).then((final) => {
        if (final && final.status !== receipt.status)
          this.reportReceipt(final, options)
        options.onFinalized(final ?? receipt)
      })

      return receipt
    } catch (err) {
      options.onError(this.formatError(err))
    }
  }

  /**
   * Sends a server-prepared transaction as ONE plain `eth_sendTransaction` from
   * the wallet's own address: never a Call Permit, never the dispatch
   * precompile, never `wallet_sendTransaction` (viem's walletClient falls back
   * to it after some errors, a second send), and no chain switch. `to`, `data`,
   * `value` and `chainId` go out exactly as given; gas, fees and nonce are
   * estimated as on the plain route. Everything before `onPrompt` is a refusal:
   * nothing reached the wallet's send; from `onPrompt` on, no outcome is a
   * refusal. The provider's error is read for its own `code` before anything
   * wraps it, and a 4001 counts as a decline only when the error carries no
   * hash-shaped value. It does not throw itself; a callback that throws
   * propagates.
   */
  async sendPreparedTransaction(
    prepared: PreparedEvmTransaction,
    options: PreparedSendOptions,
  ): Promise<PreparedSendOutcome> {
    const refuse = (reason: PreparedSendRefusal): PreparedSendOutcome => {
      options.onError(PREPARED_SEND_ERRORS.refused)
      return { kind: "refused", reason }
    }

    const from = prepared.from.toLowerCase()
    let reader: PublicClient
    let request: Record<string, string>
    try {
      const accounts: unknown = await this.provider.request({
        method: "eth_accounts",
      })
      const active =
        Array.isArray(accounts) && typeof accounts[0] === "string"
          ? accounts[0].toLowerCase()
          : null
      if (active !== from || this.address.toLowerCase() !== from)
        return refuse("account")

      const walletChainId: unknown = await this.provider.request({
        method: "eth_chainId",
      })
      if (
        typeof walletChainId !== "string" ||
        Number(walletChainId) !== prepared.chainId
      )
        return refuse("chain")

      reader = (
        options.priorityRpcUrl
          ? createPublicClient({
              transport: http(wsToHttp(options.priorityRpcUrl)),
            })
          : createPublicClient({ transport: custom(this.provider) })
      ) as PublicClient
      if ((await reader.getChainId()) !== prepared.chainId)
        return refuse("read_chain")

      const [gas, gasPriceBase, nonce] = await Promise.all([
        reader.estimateGas({
          account: from as Address,
          to: prepared.to as Address,
          data: prepared.data as Hex,
          value: hexToBigInt(prepared.value as Hex),
        }),
        reader.getGasPrice(),
        reader.getTransactionCount({ address: from as Address }),
      ])
      const gasPrice = getPermitGasPrice(gasPriceBase)
      request = {
        from: prepared.from,
        to: prepared.to,
        data: prepared.data,
        value: prepared.value,
        chainId: numberToHex(prepared.chainId),
        gas: numberToHex(getPermitGasLimit(gas, 0n)),
        maxFeePerGas: numberToHex(gasPrice),
        maxPriorityFeePerGas: numberToHex(gasPrice),
        nonce: numberToHex(nonce),
      }
    } catch {
      return refuse("estimate")
    }

    options.onPrompt()
    let hash: Hex
    try {
      const answer: unknown = await this.provider.request({
        method: "eth_sendTransaction",
        params: [request as never],
      })
      if (typeof answer !== "string" || !TX_HASH_RE.test(answer)) {
        options.onError(PREPARED_SEND_ERRORS.failed)
        return { kind: "failed", code: null }
      }
      hash = answer as Hex
    } catch (error) {
      const code = getEip1193ErrorCode(error)
      const hashes = findHashes(error)
      // Rule 11: a decline is a raw 4001 AND no hash. A hash anywhere in the
      // error means the wallet may have sent: never a decline.
      if (code === EIP1193_USER_REJECTED && !hashes.any) {
        options.onError(PREPARED_SEND_ERRORS.rejected)
        return { kind: "rejected" }
      }
      if (hashes.keyed) {
        // Checking either way; the hash counts only once its receipt is seen.
        const surfaced = hashes.keyed
        void this.waitForMined(reader, surfaced).then(
          (mined) => mined && options.onMined(mined.hash, mined.status),
        )
        options.onError(PREPARED_SEND_ERRORS.failed)
        return { kind: "failed", code, hash: surfaced }
      }
      options.onError(PREPARED_SEND_ERRORS.failed)
      return { kind: "failed", code }
    }

    options.onSubmitted(hash)

    let receipt: TransactionReceipt
    let replacement: { reason: string; hash: Hex } | null = null
    try {
      receipt = await reader.waitForTransactionReceipt({
        hash,
        onReplaced: (r) => {
          replacement = { reason: r.reason, hash: r.transaction.hash }
        },
      })
    } catch {
      options.onReceipt("unknown")
      options.onError(PREPARED_SEND_ERRORS.receipt)
      return { kind: "sent", hash, receipt: "unknown" }
    }
    const replaced = replacement as { reason: string; hash: Hex } | null
    if (replaced && replaced.reason !== "repriced") {
      // Cancelled or replaced by another transaction: this one did not run.
      options.onReceipt("unknown")
      options.onError(PREPARED_SEND_ERRORS.receipt)
      return { kind: "sent", hash, receipt: "unknown" }
    }
    // A speed-up is the same call under a new hash: follow it.
    const finalHash = replaced ? replaced.hash : hash
    if (replaced) options.onRepriced(finalHash)
    const report = (r: TransactionReceipt) => {
      options.onReceipt(r.status === "success" ? "success" : "reverted")
      this.reportReceipt(r, options)
    }
    report(receipt)
    options.onMined(
      finalHash,
      receipt.status === "success" ? "success" : "reverted",
    )

    void this.waitForFinalReceipt(finalHash, {}, reader).then((final) => {
      if (final && final.status !== receipt.status) report(final)
      options.onFinalized(final ?? receipt)
    })

    return {
      kind: "sent",
      hash: finalHash,
      receipt: receipt.status === "success" ? "success" : "reverted",
    }
  }

  /** The mined receipt of `hash` (following a speed-up), or null: cancelled, replaced or not seen. */
  private async waitForMined(
    reader: PublicClient,
    hash: Hex,
  ): Promise<{ hash: Hex; status: "success" | "reverted" } | null> {
    let replaced: { reason: string; hash: Hex } | null = null
    try {
      const receipt = await reader.waitForTransactionReceipt({
        hash,
        onReplaced: (r) => {
          replaced = { reason: r.reason, hash: r.transaction.hash }
        },
      })
      const r = replaced as { reason: string; hash: Hex } | null
      if (r && r.reason !== "repriced") return null
      return {
        hash: r ? r.hash : hash,
        status: receipt.status === "success" ? "success" : "reverted",
      }
    } catch {
      return null
    }
  }

  private reportReceipt(
    receipt: TransactionReceipt,
    options: Pick<EthereumSignerOptions, "onSuccess" | "onError">,
  ) {
    if (receipt.status === "reverted") {
      options.onError(this.formatError(new ExecutionRevertedError()))
    } else {
      options.onSuccess(receipt)
    }
  }

  /** The receipt once a finalized block holds it; null if that takes too long. */
  private async waitForFinalReceipt(
    hash: Hex,
    { interval = 3_000, timeout = 180_000 } = {},
    client?: PublicClient,
  ): Promise<TransactionReceipt | null> {
    const deadline = Date.now() + timeout
    while (Date.now() < deadline) {
      // Without `client` (every non-strict caller) this reads the signer's
      // current client on each poll, as before; the strict send pins its own.
      const reader = client ?? this.publicClient
      const [receipt, finalized] = await Promise.all([
        reader.getTransactionReceipt({ hash }).catch(() => null),
        reader.getBlock({ blockTag: "finalized" }).catch(() => null),
      ])
      if (receipt && finalized && finalized.number >= receipt.blockNumber)
        return receipt
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
    return null
  }

  async signAndSubmitNative(
    call: TransactionCall,
    options: EthereumSignerOptions,
  ) {
    try {
      const nonce = await this.publicClient.getTransactionCount({
        address: this.address as Hex,
      })
      const txHash = await this.walletClient.sendTransaction({
        account: this.address as Hex,
        data: call.data as Hex,
        to: call.to,
        nonce,
        chain: this.publicClient.chain,
        value: call?.value,
      })

      options.onSubmitted(txHash)
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      })
      if (receipt.status === "reverted") {
        options.onError(this.formatError(new ExecutionRevertedError()))
      } else {
        options.onSuccess(receipt)
      }

      options.onFinalized(receipt)

      return receipt
    } catch (err) {
      options.onError(this.formatError(err))
    }
  }

  async signAndSubmit(call: TransactionCall, options: EthereumSignerOptions) {
    const chain = await this.switchChain(options)

    if (chain.key === HYDRATION_CHAIN_KEY) {
      return this.signAndSubmitHydration(call, options)
    }

    return this.signAndSubmitNative(call, options)
  }
}
