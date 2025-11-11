import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Big } from "big.js"
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
  EVM_CALL_PERMIT_TYPES,
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
  onFinalized: (receipt: TransactionReceipt) => void
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
      const latestBlock = await this.publicClient.getBlock()

      const callPermitContract = getContract({
        address: EVM_CALL_PERMIT_ADDRESS,
        abi: EVM_CALL_PERMIT_ABI,
        client: this.publicClient,
      })

      const nonce = await callPermitContract.read.nonces([this.address as Hex])

      const tx = {
        from: this.address as Address,
        to: EVM_DISPATCH_ADDRESS as Hex,
        data: data as Hex,
      } as const

      // @TODO check gas estimation, why it is not working
      // const gas = await this.publicClient.estimateGas(tx)
      const gas = 1_000_000n

      const createPermitMessageData = () => {
        const message: PermitMessage = {
          ...tx,
          value: 0,
          gaslimit: Big(gas.toString())
            .mul(1.2) // add 20%
            .round()
            .toNumber(),
          nonce: Number(nonce),
          deadline: Number(latestBlock.timestamp) + 3600, // 1 hour deadline,
        }

        const typedData = JSON.stringify({
          types: EVM_CALL_PERMIT_TYPES,
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

      const isEvmChain = !!chain && isAnyEvmChain(chain)

      if (!isEvmChain) throw new Error(`Chain ${chainKey} is not an EVM chain`)

      const { client } = chain

      await this.walletClient.switchChain({ id: client.chain.id })

      const [/*gas,*/ gasPrice, nonce] = await Promise.all([
        // this.publicClient.estimateGas({
        //   account: this.address as Hex,
        //   data: call.data as Hex,
        //   to: call.to,
        // }),
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
        // @TODO check gas estimation, why it is not working
        gas: call?.gasLimit || 1_000_000n,
      })

      options.onSubmitted(txHash)

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      options.onSuccess(receipt)
      options.onFinalized(receipt)

      return receipt
    } catch (err) {
      options.onError(err instanceof Error ? err.message : "Unknown error")
    }
  }
}
