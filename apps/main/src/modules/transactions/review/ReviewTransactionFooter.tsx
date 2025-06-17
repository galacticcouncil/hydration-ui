import { Button, ExternalLink, Spinner } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFooter = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const { tx, onClose, isIdle, isSigning, signAndSubmit } = useTransaction()

  const isIncompatible = !!account?.isIncompatible
  const pjsUrl = usePolkadotJSExtrinsicUrl(tx)

  if (isIdle) {
    return (
      <>
        <Button size="large" variant="tertiary" onClick={onClose}>
          {t("close")}
        </Button>
        {isIncompatible && pjsUrl ? (
          <Button size="large" asChild>
            <ExternalLink href={pjsUrl}>
              {t("transaction.sign.openInPjs")}
            </ExternalLink>
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
