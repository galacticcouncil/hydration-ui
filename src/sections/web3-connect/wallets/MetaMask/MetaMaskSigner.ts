import {
  JsonRpcSigner,
  TransactionRequest,
  Web3Provider,
} from "@ethersproject/providers"
import { DISPATCH_ADDRESS } from "utils/evm"
import { MetaMaskLikeProvider, requestNetworkSwitch } from "utils/metamask"
import { chainsMap } from "@galacticcouncil/xcm-cfg"

export class MetaMaskSigner {
  address: string
  provider: MetaMaskLikeProvider
  signer: JsonRpcSigner

  constructor(address: string, provider: MetaMaskLikeProvider) {
    this.address = address
    this.provider = provider
    this.signer = this.getSigner(provider)
  }

  getSigner(provider: MetaMaskLikeProvider) {
    return new Web3Provider(provider).getSigner()
  }

  setAddress(address: string) {
    this.address = address
  }

  getGasValues(tx: TransactionRequest) {
    return Promise.all([
      this.signer.provider.estimateGas(tx),
      this.signer.provider.getGasPrice(),
    ])
  }

  sendDispatch = async (data: string) => {
    return this.sendTransaction({
      to: DISPATCH_ADDRESS,
      data,
      from: this.address,
    })
  }

  sendTransaction = async (
    transaction: TransactionRequest & { chain?: string },
  ) => {
    const { chain, ...tx } = transaction
    const from = chain && chainsMap.get(chain) ? chain : "hydradx"
    await requestNetworkSwitch(this.provider, {
      chain: from,
      onSwitch: () => {
        // update signer after network switch
        this.signer = this.getSigner(this.provider)
      },
    })

    if (from === "hydradx") {
      const [gas, gasPrice] = await this.getGasValues(tx)

      const onePrc = gasPrice.div(100)
      const gasPricePlus = gasPrice.add(onePrc)

      return await this.signer.sendTransaction({
        maxPriorityFeePerGas: gasPricePlus,
        maxFeePerGas: gasPricePlus,
        gasLimit: gas.mul(11).div(10), // add 10%
        ...tx,
      })
    } else {
      return await this.signer.sendTransaction({
        ...tx,
      })
    }
  }
}
