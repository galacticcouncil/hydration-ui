import { PolkadotSigner } from "polkadot-api"
import { isObjectType } from "remeda"

import { EthereumSigner } from "@/signers/EthereumSigner"

export const isPolkadotSigner = (signer: unknown): signer is PolkadotSigner => {
  return (
    isObjectType(signer) &&
    "publicKey" in signer &&
    "signTx" in signer &&
    "signBytes" in signer
  )
}

export const isEthereumSigner = (signer: unknown): signer is EthereumSigner =>
  signer instanceof EthereumSigner
