import { Web3Provider } from "@ethersproject/providers"

const DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"

export class MetaMaskSigner {
  address: string
  provider: Web3Provider

  constructor(address: string, provider: Web3Provider) {
    this.address = address
    this.provider = provider
  }

  setAddress(address: string) {
    this.address = address
  }

  sendDispatch = async (data: string) => {
    const signer = this.provider.getSigner()
    const tx = {
      to: DISPATCH_ADDRESS,
      data,
      from: this.address,
    }
    const [gas, gasPrice] = await Promise.all([
      this.provider.estimateGas(tx),
      this.provider.getGasPrice(),
    ])

    return await signer.sendTransaction({
      ...tx,
      maxPriorityFeePerGas: gasPrice,
      maxFeePerGas: gasPrice,
      // add 10%
      gasLimit: gas.mul(11).div(10),
    })
  }
}
