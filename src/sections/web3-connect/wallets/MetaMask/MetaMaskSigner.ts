import {
  ExternalProvider,
  JsonRpcSigner,
  Web3Provider,
} from "@ethersproject/providers"
import { SDKProvider } from "@metamask/sdk"
import { requestNetworkSwitch } from "utils/metamask"

const DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"

export class MetaMaskSigner {
  address: string
  provider: SDKProvider
  signer: JsonRpcSigner

  constructor(address: string, provider: SDKProvider) {
    this.address = address
    this.provider = provider
    this.signer = this.getSigner(provider)
  }

  getSigner(provider: SDKProvider) {
    return new Web3Provider(provider as unknown as ExternalProvider).getSigner()
  }

  setAddress(address: string) {
    this.address = address
  }

  sendDispatch = async (data: string) => {
    await requestNetworkSwitch(this.provider, () => {
      // update signer after network switch
      this.signer = this.getSigner(this.provider)
    })

    const tx = {
      to: DISPATCH_ADDRESS,
      data,
      from: this.address,
    }
    const [gas, gasPrice] = await Promise.all([
      this.signer.provider.estimateGas(tx),
      this.signer.provider.getGasPrice(),
    ])

    return await this.signer.sendTransaction({
      ...tx,
      maxPriorityFeePerGas: gasPrice,
      maxFeePerGas: gasPrice,
      // add 10%
      gasLimit: gas.mul(11).div(10),
    })
  }
}
