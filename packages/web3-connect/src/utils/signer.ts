import { PolkadotSigner } from "polkadot-api"
import { isObjectType } from "remeda"

import { EthereumSigner } from "@/signers/EthereumSigner"
import { SolanaSigner } from "@/signers/SolanaSigner"
import { SuiSigner } from "@/signers/SuiSigner"

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

export const isSolanaSigner = (signer: unknown): signer is SolanaSigner =>
  signer instanceof SolanaSigner

export const isSuiSigner = (signer: unknown): signer is SuiSigner =>
  signer instanceof SuiSigner
