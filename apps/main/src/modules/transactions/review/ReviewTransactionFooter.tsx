import { Button, Spinner } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"
import { AnyTransaction } from "@/states/transactions"

export const usePolkadotJSExtrinsicUrl = (tx: AnyTransaction) => {
  const { papiCompatibilityToken } = useRpcProvider()
  const { rpcUrl } = useProviderRpcUrlStore()

  const callData = isPapiTransaction(tx)
    ? tx.getEncodedData(papiCompatibilityToken)
    : null

  if (callData) {
    const url = encodeURIComponent(rpcUrl ?? import.meta.env.VITE_PROVIDER_URL)
    const hex = callData.asHex()
    return `https://polkadot.js.org/apps/?rpc=${url}#/extrinsics/decode/${hex}`
  }
}

export const ReviewTransactionFooter = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const { tx, onClose, isIdle, isSigning, signAndSubmit } = useTransaction()

  const isIncompatible = account?.isIncompatible ?? false
  const pjsUrl = usePolkadotJSExtrinsicUrl(tx)

  if (isIdle) {
    return (
      <>
        <Button size="large" variant="tertiary" onClick={onClose}>
          {t("close")}
        </Button>
        {isIncompatible && pjsUrl ? (
          <Button size="large" asChild>
            <a href={pjsUrl} target="_blank" rel="noopener noreferrer">
              {t("transaction.sign.openInPjs")}
            </a>
          </Button>
        ) : (
          <Button
            size="large"
            onClick={signAndSubmit}
            disabled={isIncompatible || isSigning}
          >
            {isSigning && <Spinner />}
            {t("transaction.sign")}
          </Button>
        )}
      </>
    )
  }
  return (
    <Button size="large" width="100%" onClick={onClose}>
      {t("close")}
    </Button>
  )
}
