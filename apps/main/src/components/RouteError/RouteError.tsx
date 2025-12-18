import { Alert, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useCopy } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { ErrorRouteComponent } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import { useBestNumber, useChainSpecData } from "@/api/chain"
import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useAssets } from "@/providers/assetsProvider"
import { stringifyErrorContext } from "@/utils/errors"

export const RouteError: ErrorRouteComponent = ({ error }) => {
  const { t } = useTranslation()
  const { copied, copy } = useCopy(5000)
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()

  const { data: chain } = useChainSpecData()
  const { data: bestNumber } = useBestNumber()
  const { data: feeAssetId } = useAccountFeePaymentAssetId()

  return (
    <Flex width="100vw" height="100vh" justify="center" align="center" p={20}>
      <Flex direction="column" gap={20} align="center">
        <Text as="h1" font="primary" fs={[30, null, 40]} align="center">
          {t("routeError.title")}
        </Text>
        {error instanceof Error && (
          <Alert variant="error" description={error.toString()} />
        )}
        <Flex gap={10}>
          <Button
            variant="muted"
            outline
            onClick={() =>
              copy(
                stringifyErrorContext({
                  message: error?.message ?? "",
                  address: account?.address ?? "",
                  wallet: account?.provider ?? "",
                  feePaymentAsset: isNumber(feeAssetId)
                    ? `${getAssetWithFallback(feeAssetId).symbol} (${feeAssetId})`
                    : "",
                  specVersion:
                    chain?.lastRuntimeUpgrade?.spec_version?.toString() ?? "",
                  blockNumber:
                    bestNumber?.parachainBlockNumber?.toString() ?? "",
                  path: window.location.pathname,
                }),
              )
            }
          >
            {copied ? t("copied") : t("copyError")}
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {t("routeError.reloadPage")}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
