import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { Transaction } from "@galacticcouncil/sdk"
import { DryRunResult, EvmCall } from "@galacticcouncil/xcm-sdk"
import { SubstrateApis, AnyChain, Parachain } from "@galacticcouncil/xcm-core"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { TxInfo } from "@galacticcouncil/apps"
import { isAnyParachain } from "utils/helpers"
import { WalletMode } from "sections/web3-connect/store/useWeb3ConnectStore"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
} from "sections/web3-connect/constants/providers"

export const HYDRATION_CHAIN_KEY = "hydration"
export const DEFAULT_NATIVE_CHAIN = "assethub"
export const DEFAULT_EVM_CHAIN = "ethereum"
export const DEFAULT_SOL_CHAIN = "solana"
export const DEFAULT_DEST_CHAIN = HYDRATION_CHAIN_KEY

export function getDefaultSrcChain(provider?: WalletProviderType) {
  if (!provider) return DEFAULT_NATIVE_CHAIN
  if (EVM_PROVIDERS.includes(provider)) return DEFAULT_EVM_CHAIN
  if (SOLANA_PROVIDERS.includes(provider)) return DEFAULT_SOL_CHAIN
  return DEFAULT_NATIVE_CHAIN
}

export async function getSubmittableExtrinsic(txInfo: TxInfo) {
  const { transaction, meta } = txInfo

  const { srcChain } = meta ?? {}

  const chain = chainsMap.get(srcChain)

  if (chain && isAnyParachain(chain)) {
    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(chain?.ws ?? "")

    let tx: SubmittableExtrinsic | undefined
    try {
      tx = api.tx(transaction.hex)
    } catch {}

    return tx
  }
}

export function getCall(txInfo: TxInfo) {
  const { transaction, meta } = txInfo

  const tx = transaction as Transaction<EvmCall, DryRunResult | undefined>

  return {
    xcall: tx.get(),
    xcallMeta: meta,
  }
}

export function getNotificationToastTemplates(txInfo: TxInfo) {
  const { notification } = txInfo
  return {
    onLoading: (
      <span
        dangerouslySetInnerHTML={{
          __html: notification.processing.rawHtml,
        }}
      />
    ),
    onSuccess: (
      <span
        dangerouslySetInnerHTML={{
          __html: notification.success.rawHtml,
        }}
      />
    ),
    onError: (
      <span
        dangerouslySetInnerHTML={{
          __html: notification.failure.rawHtml,
        }}
      />
    ),
  }
}

export function getDesiredWalletMode(chainKey: string) {
  const chain = chainsMap.get(chainKey)

  if (!chain) return WalletMode.Default

  const isSolana = chain?.key === "solana"
  if (isSolana) return WalletMode.Solana

  const isEvmAndSubstrate = chain?.key === "hydration"
  if (isEvmAndSubstrate) return WalletMode.SubstrateEVM

  const isEvm =
    chain?.key === "acala"
      ? false
      : chain?.isEvmChain() || chain.isEvmParachain()

  if (isEvm) return WalletMode.EVM

  if (isAnyParachain(chain) && chain.usesH160Acc)
    return WalletMode.SubstrateH160

  return WalletMode.Substrate
}

export const getAddressBookMode = (chain?: AnyChain) => {
  if (!chain) return WalletMode.Default

  if (chain.isSolana()) return WalletMode.Solana

  if (isH160AddressSpace(chain)) return WalletMode.EVM

  if (isSubstrate(chain)) return WalletMode.Substrate

  if (chain.isEvmParachain()) return WalletMode.SubstrateEVM
}

function isH160AddressSpace(chain: AnyChain) {
  if (chain instanceof Parachain) {
    return chain.usesH160Acc
  }
  return chain.isEvmChain()
}

function isSubstrate(chain: AnyChain) {
  const h160AddrSpace = isH160AddressSpace(chain) || chain.key === "hydration"

  return !h160AddrSpace
}
