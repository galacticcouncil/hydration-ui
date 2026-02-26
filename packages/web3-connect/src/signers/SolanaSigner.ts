import { chainsMap } from "@galacticcouncil/xc-cfg"
import { SolanaChain } from "@galacticcouncil/xc-core"
import { SolanaCall, SolanaLilJit } from "@galacticcouncil/xc-sdk"
import { Connection, Keypair, SignatureResult } from "@solana/web3.js"
import { Buffer } from "buffer"
import waitFor, { TimeoutError } from "p-wait-for"

import { SolanaInjectedWindowProvider } from "@/types/solana"
import { dataToVersionedTx } from "@/utils/solana"

enum SolanaTxError {
  TIMEOUT = "Transaction timed out",
  SIGNING_FAILED = "Signing transaction failed",
  SIMULATION_FAILED = "Simulating transaction failed",
  SENDING_FAILED = "Sending transaction failed",
}

export type SolanaTxStatus = SignatureResult

type SolanaSignerOptions = {
  onSubmitted: (txHash: string) => void
  onSuccess: (status: SignatureResult) => void
  onError: (error: string) => void
  onFinalized: (status: SignatureResult) => void
}

export class SolanaSigner {
  address: string
  provider: SolanaInjectedWindowProvider
  connection: Connection
  lilJit: SolanaLilJit
  constructor(address: string, provider: SolanaInjectedWindowProvider) {
    const chain = chainsMap.get("solana") as SolanaChain
    this.address = address
    this.provider = provider
    this.connection = (chainsMap.get("solana") as SolanaChain).connection
    this.lilJit = new SolanaLilJit(chain)
  }

  async getTransactionStatus(hash: string) {
    return waitFor(
      async () => {
        const { value } = await this.connection.getSignatureStatus(hash, {
          searchTransactionHistory: true,
        })

        const isError = !!value?.err

        const condition =
          isError ||
          value?.confirmationStatus === "confirmed" ||
          value?.confirmationStatus === "finalized"

        return condition && waitFor.resolveWith(value)
      },
      {
        interval: 5000,
        timeout: 60000,
      },
    )
  }

  async waitForBundle(bundleId: string, onError: (error: string) => void) {
    return waitFor(
      async () => {
        const result = await this.lilJit.getInflightBundleStatuses([bundleId])
        const bundle = result.value.find((b) => b.bundle_id === bundleId)
        return bundle?.status === "Landed" && waitFor.resolveWith(bundle)
      },
      {
        interval: 5000,
        timeout: 60000,
      },
    ).catch((error) => {
      onError(
        error instanceof TimeoutError
          ? SolanaTxError.TIMEOUT
          : error instanceof Error
            ? error.message
            : SolanaTxError.SENDING_FAILED,
      )
      throw error
    })
  }

  async signAndSend(
    data: string,
    signers: Keypair[],
    options: SolanaSignerOptions,
  ) {
    const versioned = dataToVersionedTx(data, signers)

    await this.provider.connect()

    try {
      const { signature } =
        await this.provider.signAndSendTransaction(versioned)
      options.onSubmitted(signature)

      const status = await this.getTransactionStatus(signature)

      if (status?.err) {
        options.onError(status.err.toString())
      } else {
        options.onSuccess(status)
      }

      options.onFinalized(status)

      return status
    } catch (error) {
      options.onError(
        error instanceof Error ? error.message : SolanaTxError.SIGNING_FAILED,
      )
      throw error
    }
  }

  async signAndSendBatch(calls: SolanaCall[], options: SolanaSignerOptions) {
    const versioned = calls.map((c) => dataToVersionedTx(c.data, c.signers))

    await this.provider.connect()

    const signed = await this.provider.signAllTransactions(versioned)

    const encoded = signed.map((s) => {
      return Buffer.from(s.serialize()).toString("base64")
    })

    try {
      const simulation = await this.lilJit.simulateBundle(encoded)

      if (simulation.value.summary !== "succeeded") {
        const errorObj = simulation.value.summary.failed
        const [_, message] = errorObj.error.TransactionFailure
        options.onSubmitted(errorObj.tx_signature)
        options.onError(message)
        throw new Error(message || SolanaTxError.SIMULATION_FAILED)
      }

      const bundleId = await this.lilJit.sendBundle(encoded)
      options.onSubmitted(bundleId)
      const bundle = await this.waitForBundle(bundleId, options.onError)
      options.onSuccess({ err: null })
      options.onFinalized({ err: null })

      return { bundleId, bundle }
    } catch (error) {
      options.onError(
        error instanceof Error ? error.message : SolanaTxError.SIGNING_FAILED,
      )
      throw error
    }
  }
}
