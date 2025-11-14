import { SolanaChain } from "@galacticcouncil/xcm-core"
import { SolanaCall, SolanaLilJit } from "@galacticcouncil/xcm-sdk"
import { Keypair, MessageV0, VersionedTransaction } from "@solana/web3.js"
import { solanaCallToVersionedTx, SolanaWalletProvider } from "utils/solana"

export class SolanaSigner {
  address: string
  provider: SolanaWalletProvider
  constructor(address: string, provider: SolanaWalletProvider) {
    this.address = address
    this.provider = provider
  }
  async signAndSend(data: string, signers: Keypair[]) {
    const mssgBuffer = Buffer.from(data, "hex")
    const mssgArray = Uint8Array.from(mssgBuffer)
    const mssgV0 = MessageV0.deserialize(mssgArray)
    const versioned = new VersionedTransaction(mssgV0)
    await this.provider.connect()
    versioned.sign(signers)
    return this.provider.signAndSendTransaction(versioned)
  }
  async signAndSendBatch(
    calls: SolanaCall[],
    chain: SolanaChain,
    onError?: (error: unknown) => void,
  ) {
    const lilJit = new SolanaLilJit(chain)
    const versioned = calls.map((c) => solanaCallToVersionedTx(c))

    await this.provider.connect()

    const signed = await this.provider.signAllTransactions(versioned)

    const encoded = signed.map((s) => {
      return Buffer.from(s.serialize()).toString("base64")
    })

    try {
      const simulation = await lilJit.simulateBundle(encoded)

      if (simulation.value.summary !== "succeeded") {
        throw new Error("Simulation failed")
      } else {
        const bundleId = await lilJit.sendBundle(encoded)
        return {
          bundleId,
          lilJit,
        }
      }
    } catch (error) {
      onError?.(error)
      throw error
    }
  }
}
