import { Alert, Flex } from "@galacticcouncil/ui/components"
import { DryRunError } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { DcaValidationError } from "@/modules/trade/swap/sections/DCA/useDcaPriceImpactValidation"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly priceImpact: number
  readonly errors: ReadonlyArray<DcaValidationError>
  readonly dryRunError?: DryRunError | null
}

export const DcaErrors: FC<Props> = ({ priceImpact, errors, dryRunError }) => {
  const { t } = useTranslation(["common", "trade"])

  if (!errors.length && !dryRunError) {
    return null
  }

  const errorDescriptions: Record<DcaValidationError, string> = {
    [DcaValidationError.PriceImpact]: t("trade:dca.errors.priceImpact", {
      percentage: t("percent", { value: priceImpact }),
    }),
    [DcaValidationError.MinOrderBudget]: t("trade:dca.errors.minOrderBudget"),
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my="base" gap="s">
        {errors.map((error) => (
          <Alert
            key={error}
            variant="error"
            description={errorDescriptions[error]}
          />
        ))}
        {dryRunError && (
          <Alert
            variant="error"
            title={dryRunError.name}
            tooltip={dryRunError.description}
          />
        )}
      </Flex>
    </>
  )
}
