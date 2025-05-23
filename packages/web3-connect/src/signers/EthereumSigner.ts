import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, EvmChain, EvmParachain } from "@galacticcouncil/xcm-core"
import {
  Address,
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  EIP1193Provider,
  getContract,
  Hex,
  parseSignature,
  PublicClient,
  TransactionReceipt,
  WalletClient,
} from "viem"

import {
  EVM_CALL_PERMIT_ABI,
  EVM_CALL_PERMIT_ADDRESS,
  EVM_DEFAULT_CHAIN_KEY,
  EVM_DISPATCH_ADDRESS,
} from "@/config/evm"

type PermitMessage = {
  from: string
  to: string
  value: number
  data: string
  gaslimit: number
  nonce: number
  deadline: number
}

export type PermitResult = {
  signature: ReturnType<typeof parseSignature>
  message: PermitMessage
}

type TransactionCall = Omit<ExtendedEvmCall, "from" | "type" | "dryRun">

type EthereumSignerOptions = {
  chainKey?: string
  onSubmitted: (txHash: string) => void
  onSuccess: (receipt: TransactionReceipt) => void
  onError: (error: string) => void
  onFinalized: () => void
}

export class EthereumSigner {
  address: string
  provider: EIP1193Provider
  publicClient: PublicClient
  walletClient: WalletClient

  constructor(address: string, provider: EIP1193Provider) {
    this.address = address
    this.provider = provider

    this.publicClient = createPublicClient({
      transport: custom(provider),
    })

    this.walletClient = createWalletClient({
      transport: custom(provider),
    })
  }

  private isEvmChain(chain?: AnyChain): chain is EvmParachain | EvmChain {
    return chain instanceof EvmParachain || chain instanceof EvmChain
  }

  async signAndSubmitDispatch(
    call: Omit<TransactionCall, "to">,
    options: EthereumSignerOptions,
  ) {
    return this.signAndSubmit(
      {
        ...call,
        to: EVM_DISPATCH_ADDRESS,
      },
      options,
    )
  }

  getPermit = async (data: string): Promise<PermitResult> => {
    if (this.provider && this.address) {
      /* const tx =
        typeof data === "string"
          ? {
              from: this.address,
              to: DISPATCH_ADDRESS,
              data,
            }
          : {
              from: data?.from ?? "",
              to: data?.to ?? "",
              data: data.data?.toString() ?? "",
              gasLimit: data.gasLimit?.toString() ?? "0",
            }

      if (!tx.from)
        throw new Error("Permit transaction must have a 'from' field")
      if (!tx.to) throw new Error("Permit transaction must have a 'to' field")
      if (!tx.data)
        throw new Error("Permit transaction must have a 'data' field")

      let gasLimit = BigNumber(0)
      if (tx.gasLimit) {
        gasLimit = BigNumber(tx.gasLimit.toString())
      } else {
        const { gas } = await this.getGasValues(tx)
        gasLimit = BigNumber(gas.toString())
      } */

      const latestBlock = await this.publicClient.getBlock()

      /* const nonce = await this.publicClient.getTransactionCount({
        address: this.address as Hex,
      }) */

      //const callPermitContract = new Contract(CALL_PERMIT_ADDRESS, CALL_PERMIT_ABI, evm)

      const callPermitContract = getContract({
        address: EVM_CALL_PERMIT_ADDRESS,
        abi: EVM_CALL_PERMIT_ABI,
        client: this.publicClient,
      })

      const nonce = await callPermitContract.read.nonces([this.address as Hex])

      const tx = {
        from: this.address,
        to: EVM_DISPATCH_ADDRESS,
        data,
      }

      const createPermitMessageData = () => {
        const message: PermitMessage = {
          ...tx,
          value: 0,
          gaslimit: 33069,
          /* .multipliedBy(1.2) // add 20%
            .decimalPlaces(0)
            .toNumber(), */
          nonce: Number(nonce),
          deadline: Number(latestBlock.timestamp) + 3600, // 1 hour deadline,
        }

        const typedData = JSON.stringify({
          types: {
            EIP712Domain: [
              {
                name: "name",
                type: "string",
              },
              {
                name: "version",
                type: "string",
              },
              {
                name: "chainId",
                type: "uint256",
              },
              {
                name: "verifyingContract",
                type: "address",
              },
            ],
            CallPermit: [
              {
                name: "from",
                type: "address",
              },
              {
                name: "to",
                type: "address",
              },
              {
                name: "value",
                type: "uint256",
              },
              {
                name: "data",
                type: "bytes",
              },
              {
                name: "gaslimit",
                type: "uint64",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "deadline",
                type: "uint256",
              },
            ],
          },
          primaryType: "CallPermit",
          domain: {
            name: "Call Permit Precompile",
            version: "1",
            chainId: 222222,
            verifyingContract: EVM_CALL_PERMIT_ADDRESS,
          },
          message: message,
        })

        return {
          typedData,
          message,
        }
      }

      const { message, typedData } = createPermitMessageData()

      const result = await this.walletClient.request({
        method: "eth_signTypedData_v4",
        params: [this.address as Address, typedData],
      })

      const signature = parseSignature(result)

      return {
        message,
        signature,
      }
    }

    throw new Error("Error signing transaction. Provider not found")
  }

  async signAndSubmit(call: TransactionCall, options: EthereumSignerOptions) {
    try {
      const chainKey = options.chainKey ?? EVM_DEFAULT_CHAIN_KEY
      const chain = chainsMap.get(chainKey)

      if (!this.isEvmChain(chain))
        throw new Error(`Chain ${chainKey} is not an EVM chain`)

      const { client } = chain

      await this.walletClient.switchChain({ id: client.chain.id })

      const [_gas, gasPrice, nonce] = await Promise.all([
        this.publicClient.estimateGas({
          account: this.address as Hex,
          data: call.data as Hex,
          to: call.to,
        }),
        this.publicClient.getGasPrice(),
        this.publicClient.getTransactionCount({
          address: this.address as Hex,
        }),
      ])

      const fivePrc = (gasPrice / 100n) * 5n
      const gasPricePlus = gasPrice + fivePrc

      const txHash = await this.walletClient.sendTransaction({
        account: this.address as Hex,
        data: call.data as Hex,
        to: call.to,
        nonce,
        chain: client.chain as Chain,
        maxFeePerGas: call?.maxFeePerGas || gasPricePlus,
        maxPriorityFeePerGas: call?.maxPriorityFeePerGas || gasPricePlus,
        // @TODO check gas estimation
        gas: call?.gasLimit || 1_000_000n,
      })

      options.onSubmitted(txHash)

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      options.onSuccess(receipt)
      options.onFinalized()

      return receipt
    } catch (err) {
      options.onError(err instanceof Error ? err.message : "Unknown error")
    }
  }
}
