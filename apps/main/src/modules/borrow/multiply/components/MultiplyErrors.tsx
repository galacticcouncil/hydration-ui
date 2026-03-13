import { PoolError } from "@galacticcouncil/sdk-next/build/types/pool"
import { Alert, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export type MultiplyErrorsProps = {
  errors: PoolError[]
}

export const MultiplyErrors: React.FC<MultiplyErrorsProps> = ({ errors }) => {
  const { t } = useTranslation("trade")

  if (!errors.length) return null

  const getMessage = (error: PoolError): string => {
    switch (error) {
      case "InsufficientTradingAmount":
        return t("market.error.insufficientTradingAmount")
      case "MaxOutRatioExceeded":
        return t("market.error.maxOutRatioExceeded")
      case "MaxInRatioExceeded":
        return t("market.error.maxInRatioExceeded")
      case "TradeNotAllowed":
        return t("market.error.tradeNotAllowed")
      default:
        return error
    }
  }

  return (
    <Stack gap="base">
      {errors.map((error) => (
        <Alert key={error} variant="error" title={getMessage(error)} />
      ))}
    </Stack>
  )
}
