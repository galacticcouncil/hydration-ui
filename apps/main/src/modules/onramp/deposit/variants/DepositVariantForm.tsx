import {
  ModalFooter,
  Separator,
  Stack,
  Stepper,
} from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"

type DepositVariantFormProps = {
  variant: "guided" | "simple"
  symbol: string
  source: ReactNode
  amount: ReactNode
  destination: ReactNode
  routeOptions: ReactNode
  summary: ReactNode
  notices: ReactNode
  footer: ReactNode
  onBack: () => void
}

export const DepositVariantForm: FC<DepositVariantFormProps> = ({
  variant,
  symbol,
  source,
  amount,
  destination,
  routeOptions,
  summary,
  notices,
  footer,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <>
      <SOnrampStepHeader
        title={t(
          variant === "guided"
            ? "deposit.variants.depositAsset"
            : "deposit.quick.title",
          { symbol },
        )}
        align="center"
        closable
        onBack={onBack}
      />
      <DepositScrollBody noPadding contained>
        <Stack data-onramp-step={`deposit-${variant}-amount`} gap={0}>
          {variant === "guided" && (
            <>
              <Stack px="xl" pt="l" pb="base">
                <Stepper
                  compact
                  steps={[
                    t("deposit.guided.step.asset"),
                    t("deposit.guided.step.network"),
                    t("deposit.guided.step.deposit"),
                  ]}
                  activeStepIndex={2}
                />
              </Stack>
              <Separator />
            </>
          )}
          {variant === "simple" && (
            <>
              {amount}
              <Separator />
            </>
          )}
          {source && (
            <>
              <Stack px="xl" py="l">
                {source}
              </Stack>
              <Separator />
            </>
          )}
          {variant === "guided" && (
            <>
              {amount}
              <Separator />
            </>
          )}
          <Stack px="xl" py="l" gap="m">
            {destination}
          </Stack>
          {routeOptions}
          {summary}
          {notices && (
            <Stack px="xl" pb="l" gap="m">
              {notices}
            </Stack>
          )}
        </Stack>
      </DepositScrollBody>
      <Separator />
      <ModalFooter sx={{ padding: 0, display: "block" }}>{footer}</ModalFooter>
    </>
  )
}
