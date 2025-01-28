import { getNetwork, JsonRpcProvider, Network } from "@ethersproject/providers"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { getProviderInstance } from "api/provider"

export class PolkadotEvmRpcProvider extends JsonRpcProvider {
  provider: WsProvider

  constructor(api: ApiPromise) {
    const provider = getProviderInstance(api)
    const path = provider.endpoint
    super(path)
    this.provider = provider
  }

  async _uncachedDetectNetwork(): Promise<Network> {
    const chainId = await this.send("eth_chainId", [])
    return getNetwork(parseInt(chainId, 16))
  }

  send(method: string, params: Array<any> = []): Promise<any> {
    return this.provider.send(method, params)
  }
}
