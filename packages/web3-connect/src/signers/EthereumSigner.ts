import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import {
  Address,
  BaseError,
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  EIP1193Provider,
  EstimateGasParameters,
  ExecutionRevertedError,
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
  EVM_GAS_TO_WEIGHT,
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
  weight?: bigint
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

  formatError = (err: unknown): string => {
    if (err instanceof BaseError) return err.name
    if (err instanceof Error) return err.message
    return "Unknown error"
  }

  async estimateGas(tx: EstimateGasParameters, weight: bigint = 0n) {
    const [gas, gasPriceBase] = await Promise.all([
      this.publicClient.estimateGas({
        ...tx,
        account: this.address as Address,
      }),
      this.publicClient.getGasPrice(),
    ])

    const gasPriceSurplus = (gasPriceBase * 5n) / 100n // 5% surplus
    const gasPrice = gasPriceBase + gasPriceSurplus

    const gasByWeight = weight / EVM_GAS_TO_WEIGHT
    const baseGasLimit = gasByWeight > gas ? gasByWeight : gas
    const gasLimitSurplus = (baseGasLimit * 30n) / 100n // 30% surplus
    const gasLimit = baseGasLimit + gasLimitSurplus

    return {
      gas,
      gasLimit,
      gasPrice,
      maxPriorityFeePerGas: gasPrice,
      maxFeePerGas: gasPrice,
    }
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

  getPermit = async (
    data: string,
    options: EthereumSignerOptions,
  ): Promise<PermitResult> => {
    if (this.provider && this.address) {
      const weight = options.weight ?? 0n

      const callPermitContract = getContract({
        address: EVM_CALL_PERMIT_ADDRESS,
        abi: EVM_CALL_PERMIT_ABI,
        client: this.publicClient,
      })

      const tx = {
        from: this.address as Address,
        to: EVM_DISPATCH_ADDRESS as Hex,
        data: data as Hex,
      }

      const [latestBlock, chainId, estimatedGas, nonce] = await Promise.all([
        this.publicClient.getBlock(),
        this.publicClient.getChainId(),
        this.estimateGas(tx, weight),
        callPermitContract.read.nonces([this.address as Hex]),
      ])

      const createPermitMessageData = () => {
        const message: PermitMessage = {
          ...tx,
          value: 0,
          gaslimit: Number(estimatedGas.gasLimit),
          nonce: Number(nonce),
          deadline: Number(latestBlock.timestamp) + 3600, // 1 hour deadline,
        }

        const typedData = JSON.stringify({
          types: EVM_CALL_PERMIT_TYPES,
          primaryType: "CallPermit",
          domain: {
            name: "Call Permit Precompile",
            version: "1",
            chainId,
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

      try {
        const result = await this.walletClient.request({
          method: "eth_signTypedData_v4",
          params: [this.address as Address, typedData],
        })
        const signature = parseSignature(result)

        return {
          message,
          signature,
        }
      } catch (err) {
        options.onError(this.formatError(err))
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

      const [gas, nonce] = await Promise.all([
        this.estimateGas(
          {
            data: call.data as Hex,
            to: call.to,
          },
          options.weight,
        ),
        this.publicClient.getTransactionCount({
          address: this.address as Hex,
        }),
      ])

      const txHash = await this.walletClient.sendTransaction({
        account: this.address as Hex,
        data: call.data as Hex,
        to: call.to,
        nonce,
        chain: client.chain as Chain,
        maxFeePerGas: call?.maxFeePerGas || gas.maxFeePerGas,
        maxPriorityFeePerGas:
          call?.maxPriorityFeePerGas || gas.maxPriorityFeePerGas,
        gas: call?.gasLimit || gas.gasLimit,
      })

      options.onSubmitted(txHash)

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      })

      if (receipt.status === "reverted") {
        options.onError(this.formatError(new ExecutionRevertedError()))
      } else {
        options.onSuccess(receipt)
      }

      options.onFinalized()

      return receipt
    } catch (err) {
      options.onError(this.formatError(err))
    }
  }
}
