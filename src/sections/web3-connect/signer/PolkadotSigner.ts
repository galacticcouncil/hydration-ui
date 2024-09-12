import { TypeRegistry } from "@polkadot/types"
import type {
  Signer,
  SignerPayloadJSON,
  SignerPayloadRaw,
  SignerResult,
} from "@polkadot/types/types"
import type { HexString } from "@polkadot/util/types"
import SignClient from "@walletconnect/sign-client"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { POLKADOT_CAIP_ID_MAP } from "sections/web3-connect/wallets/WalletConnect"
import { genesisHashToChain } from "utils/helpers"

export type KeypairType = "ed25519" | "sr25519"
export type WcAccount = `${string}:${string}:${string}`
export type PolkadotNamespaceChainId = `polkadot:${string}`
export interface WalletConnectConfiguration extends SignClientTypes.Options {}

interface Signature {
  signature: HexString
}

export class PolkadotSigner implements Signer {
  registry: TypeRegistry
  client: SignClient
  session: SessionTypes.Struct
  id = 0

  constructor(client: SignClient, session: SessionTypes.Struct) {
    this.client = client
    this.session = session
    this.registry = new TypeRegistry()
  }

  // this method is set this way to be bound to this class.
  signPayload = async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    const chain = genesisHashToChain(payload.genesisHash as `0x${string}`)
    const chainId = POLKADOT_CAIP_ID_MAP[chain?.network]

    let request = {
      topic: this.session.topic,
      chainId,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "polkadot_signTransaction",
        params: { address: payload.address, transactionPayload: payload },
      },
    }
    let { signature } = await this.client.request<Signature>(request)
    return { id: ++this.id, signature }
  }

  // this method is set this way to be bound to this class.
  // It might be used outside of the object context to sign messages.
  // ref: https://polkadot.js.org/docs/extension/cookbook#sign-a-message
  signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    const chainId = POLKADOT_CAIP_ID_MAP["hydradx"]
    let request = {
      topic: this.session.topic,
      chainId,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "polkadot_signMessage",
        params: { address: raw.address, message: raw.data },
      },
    }
    let { signature } = await this.client.request<Signature>(request)
    return { id: ++this.id, signature }
  }
}
