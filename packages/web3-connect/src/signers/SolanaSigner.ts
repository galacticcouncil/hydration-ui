import { chainsMap } from "@galacticcouncil/xc-cfg"
import { SolanaChain } from "@galacticcouncil/xc-core"
import { SolanaCall } from "@galacticcouncil/xc-sdk"
import { Connection, Keypair, SignatureResult } from "@solana/web3.js"
import waitFor from "p-wait-for"

import { SolanaInjectedWindowProvider } from "@/types/solana"
import { dataToVersionedTx } from "@/utils/solana"

enum SolanaTxError {
  SIGNING_FAILED = "Signing transaction failed",
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
  constructor(address: string, provider: SolanaInjectedWindowProvider) {
    this.address = address
    this.provider = provider
    this.connection = (chainsMap.get("solana") as SolanaChain).connection
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

  async signAndSend(
    data: string,
    signers: Keypair[],
    options: SolanaSignerOptions,
  ) {
    const versioned = await dataToVersionedTx(this.connection, data, signers)

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
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash()

    const versioned = await Promise.all(
      calls.map((c) =>
        dataToVersionedTx(this.connection, c.data, c.signers, blockhash),
      ),
    )

    await this.provider.connect()

    const signed = await this.provider.signAllTransactions(versioned)

    try {
      const signatures: string[] = []

      for (const [index, tx] of signed.entries()) {
        const signature = await this.connection.sendTransaction(tx)
        signatures.push(signature)

        if (index === 0) {
          options.onSubmitted(signature)
        }

        const { value } = await this.connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        )

        if (value.err) {
          throw new Error(value.err.toString())
        }
      }

      options.onSuccess({ err: null })
      options.onFinalized({ err: null })

      return signatures
    } catch (error) {
      options.onError(
        error instanceof Error ? error.message : SolanaTxError.SENDING_FAILED,
      )
      throw error
    }
  }
}
