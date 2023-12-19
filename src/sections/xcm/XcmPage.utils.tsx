import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { isEvmAccount } from "utils/evm"
import { XCall, SubstrateApis } from "@galacticcouncil/xcm-sdk"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { TxInfo } from "@galacticcouncil/apps"
import { isEvmXCall } from "sections/transaction/ReviewTransactionXCallForm.utils"

export const DEFAULT_NATIVE_CHAIN = "polkadot"
export const DEFAULT_EVM_CHAIN = "moonbeam"
export const DEFAULT_DEST_CHAIN = "hydradx"

export function getDefaultSrcChain(address?: string) {
  return isEvmAccount(address) ? DEFAULT_EVM_CHAIN : DEFAULT_NATIVE_CHAIN
}

export async function getSubmittableExtrinsic(txInfo: TxInfo) {
  const { transaction, meta } = txInfo

  const { srcChain } = meta ?? {}
  const chain = chainsMap.get(srcChain)

  const apiPool = SubstrateApis.getInstance()
  const api = await apiPool.api(chain?.ws ?? "")

  let tx: SubmittableExtrinsic | undefined
  try {
    tx = api.tx(transaction.hex)
  } catch {}

  return tx
}

export function getEvmXcall(txInfo: TxInfo) {
  const { transaction, meta } = txInfo

  const xcall = transaction.get<XCall>()
  const isEvmXcallValid = isEvmXCall(xcall)

  return {
    xcall: isEvmXcallValid ? xcall : undefined,
    xcallMeta: isEvmXcallValid ? meta : undefined,
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
