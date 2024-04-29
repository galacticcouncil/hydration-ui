import {
  JsonRpcSigner,
  TransactionRequest,
  Web3Provider,
} from "@ethersproject/providers"
import { evmChains } from "@galacticcouncil/xcm-sdk"
import { DISPATCH_ADDRESS } from "utils/evm"
import { MetaMaskLikeProvider, requestNetworkSwitch } from "utils/metamask"
import { SignatureLike } from "@ethersproject/bytes"
import { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util"
import { ethers } from "ethers"
import { Buffer } from "buffer"

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

  extractRSV = (
    signatureHex: string,
  ): {
    r: string
    s: string
    v: number
  } => {
    const signature = Buffer.from(signatureHex.slice(2), "hex")
    const r = signature.slice(0, 32).toString("hex")
    const s = signature.slice(32, 64).toString("hex")
    const v = signature[64]
    return { r, s, v }
  }

  sendPermitDispatch = async (data: string): Promise<SignatureLike> => {
    if (this.provider && this.address) {
      const createPermitMessageData = () => {
        const message = {
          from: this.address,
          to: DISPATCH_ADDRESS,
          data: data,
        }

        const typedData = {
          types: {
            CallPermit: [
              { name: "from", type: "address" },
              { name: "to", type: "address" },
              { name: "data", type: "bytes" },
            ],
          },
          primaryType: "CallPermit",
          domain: {
            name: "Call Permit Precompile",
            version: "1",
            chainId: 222222,
            verifyingContract: "0x000000000000000000000000000000000000080a",
          },
          message: message,
        }

        return {
          typedData,
          message,
        }
      }

      const messageData = createPermitMessageData()

      const signature = await this.signer._signTypedData(
        messageData.typedData.domain,
        messageData.typedData.types,
        messageData.message,
      )

      console.log(signature, this.extractRSV(signature))

      //const ethersSignature = Signature.from(signature)

      return signature
    }

    throw new Error("Error signing transaction. Provider not found")
  }

  sendTransaction = async (
    transaction: TransactionRequest & { chain?: string },
  ) => {
    const { chain, ...tx } = transaction
    const from = chain && evmChains[chain] ? chain : "hydradx"
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
