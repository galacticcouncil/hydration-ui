import {
  Alert,
  Button,
  ExternalLink,
  Flex,
  Spinner,
  Stack,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import { useTransactionAlerts } from "@/modules/transactions/hooks/useTransactionAlerts"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFooter = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const {
    tx,
    onClose,
    isIdle,
    isSigning,
    signAndSubmit,
    isLoadingFeeEstimate,
  } = useTransaction()

  const alerts = useTransactionAlerts()

  const pjsUrl = usePolkadotJSExtrinsicUrl(tx)

  const isIncompatible = !!account?.isIncompatible
  const isLoading = isSigning || isLoadingFeeEstimate
  const isDisabled = isIncompatible || alerts.length > 0 || isLoading

  if (isIdle) {
    return (
      <Stack width="100%" gap={10}>
        {alerts.map(({ key, ...alert }) => (
          <Alert key={key} {...alert} />
        ))}
        <Flex
          direction={["column-reverse", "row"]}
          justify="space-between"
          gap={10}
        >
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
            <Button size="large" onClick={signAndSubmit} disabled={isDisabled}>
              {isLoading && <Spinner />}
              {t("transaction.sign")}
            </Button>
          )}
        </Flex>
      </Stack>
    )
  }
  return (
    <Button size="large" width="100%" onClick={onClose}>
      {t("close")}
    </Button>
  )
}
