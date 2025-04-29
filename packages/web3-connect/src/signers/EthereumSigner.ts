import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, EvmChain, EvmParachain } from "@galacticcouncil/xcm-core"
import { EvmCall } from "@galacticcouncil/xcm-sdk"
import {
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  EIP1193Provider,
  Hex,
  PublicClient,
  TransactionReceipt,
  WalletClient,
} from "viem"

import { EVM_DEFAULT_CHAIN_KEY, EVM_DISPATCH_ADDRESS } from "@/config/evm"

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
  signature: {
    r: string
    s: string
    v: number
  }
  message: PermitMessage
}

type CallType = Omit<EvmCall, "from" | "type" | "dryRun">

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
    call: Omit<CallType, "to">,
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

  async signAndSubmit(call: CallType, options: EthereumSignerOptions) {
    try {
      const chainKey = options.chainKey ?? EVM_DEFAULT_CHAIN_KEY
      const chain = chainsMap.get(chainKey)

      if (!this.isEvmChain(chain))
        throw new Error(`Chain ${chainKey} is not an EVM chain`)

      const { client } = chain

      await this.walletClient.switchChain({ id: client.chain.id })

      const [gas, gasPrice] = await Promise.all([
        this.publicClient.estimateGas({
          account: this.address as Hex,
          data: call.data as Hex,
          to: call.to,
        }),
        this.publicClient.getGasPrice(),
      ])

      const fivePrc = (gasPrice / 100n) * 5n
      const gasPricePlus = gasPrice + fivePrc

      const txHash = await this.walletClient.sendTransaction({
        account: this.address as Hex,
        chain: client.chain as Chain,
        data: call.data as Hex,
        maxPriorityFeePerGas: gasPricePlus,
        maxFeePerGas: gasPricePlus,
        gas: (gas * 11n) / 10n,
        to: call.to,
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
