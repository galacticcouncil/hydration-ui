import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { isEvmAccount } from "utils/evm"
import { XCallEvm } from "@galacticcouncil/xcm-sdk"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { TxInfo } from "@galacticcouncil/apps"
import { isAnyParachain } from "utils/helpers"

export const HYDRADX_CHAIN_KEY = "hydradx"
export const DEFAULT_NATIVE_CHAIN = "assethub"
export const DEFAULT_EVM_CHAIN = "ethereum"
export const DEFAULT_DEST_CHAIN = HYDRADX_CHAIN_KEY

export function getDefaultSrcChain(address?: string) {
  return isEvmAccount(address) ? DEFAULT_EVM_CHAIN : DEFAULT_NATIVE_CHAIN
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

export function getXCall(txInfo: TxInfo) {
  const { transaction, meta } = txInfo

  return {
    xcall: transaction.get<XCallEvm>(),
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
