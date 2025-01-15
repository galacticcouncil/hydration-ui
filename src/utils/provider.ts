import { getNetwork, JsonRpcProvider, Network } from "@ethersproject/providers"
import { ApiPromise, WsProvider } from "@polkadot/api"

export class PolkadotEvmRpcProvider extends JsonRpcProvider {
  provider: WsProvider

  constructor(api: ApiPromise) {
    const provider = PolkadotEvmRpcProvider.getProviderInstance(api)
    const path = provider.endpoint
    super(path)
    this.provider = provider
  }

  async _uncachedDetectNetwork(): Promise<Network> {
    const chainId = await this.send("eth_chainId", [])
    return getNetwork(parseInt(chainId, 16))
  }

  static getProviderInstance(api: ApiPromise) {
    // @ts-expect-error Property '_options' is protected
    const options = api?._options
    return options?.provider as WsProvider
  }

  send(method: string, params: Array<any> = []): Promise<any> {
    return this.provider.send(method, params)
  }
}
