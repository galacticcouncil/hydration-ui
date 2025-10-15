import { Keypair, MessageV0, VersionedTransaction } from "@solana/web3.js"

import { SolanaInjectedWindowProvider } from "@/types/solana"

export class SolanaSigner {
  address: string
  provider: SolanaInjectedWindowProvider
  constructor(address: string, provider: SolanaInjectedWindowProvider) {
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
}
