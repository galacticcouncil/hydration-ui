import { Check } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useCopy } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { useChainSpecData } from "@/api/chainSpec"
import { TransactionStatus } from "@/components/TransactionStatus"
import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useAssets } from "@/providers/assetsProvider"
import { stringifyErrorContext } from "@/utils/errors"

const ErrorCopyButton = () => {
  const { t } = useTranslation()
  const { copied, copy } = useCopy(5000)
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { tx, feeAssetId, error } = useTransaction()

  const { data: chain } = useChainSpecData()
  const { data: bestNumber } = useBestNumber()

  const pjsUrl = usePolkadotJSExtrinsicUrl(tx)
  const evmTxData = isEvmCall(tx) ? tx.data : undefined

  const errorMessage = stringifyErrorContext({
    message: error ?? "",
    address: account?.rawAddress ?? "",
    wallet: account?.provider ?? "",
    feePaymentAsset: `${getAssetWithFallback(feeAssetId).symbol} (${feeAssetId})`,
    specVersion: chain?.lastRuntimeUpgrade?.spec_version?.toString() ?? "",
    blockNumber: bestNumber?.parachainBlockNumber?.toString() ?? "",
    path: window.location.pathname,
    transaction: pjsUrl || evmTxData,
  })

  return (
    <Button
      size="micro"
      uppercase
      variant="muted"
      outline
      onClick={() => copy(errorMessage)}
      title={errorMessage}
    >
      <Flex gap="s" color={copied && getToken("accents.success.emphasis")}>
        {copied && <Icon size="xs" component={Check} />}
        <Text>{copied ? t("copied") : t("copyError")}</Text>
      </Flex>
    </Button>
  )
}

export const ReviewTransactionStatus = () => {
  const { t } = useTranslation()
  const { isIdle, status, reset, error } = useTransaction()

  if (isIdle) {
    return null
  }

  return (
    <TransactionStatus
      status={status}
      errorActions={
        <>
          <Button
            size="micro"
            uppercase
            variant="muted"
            outline
            onClick={reset}
          >
            {t("transaction.status.error.tryAgain")}
          </Button>
          {error && <ErrorCopyButton />}
        </>
      }
    />
  )
}
