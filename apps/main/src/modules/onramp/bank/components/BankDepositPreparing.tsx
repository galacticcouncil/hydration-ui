import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

// The steps the server works through, in order. The API does not say which
// one is current, so none is marked; no duration is promised (unmeasured).
const STEPS = ["address", "bridge", "ready"] as const

export const BankDepositPreparing: FC = () => {
  const { t } = useTranslation(["onramp"])

  return (
    <Stack gap="s">
      <Stack gap="xs" as="ol">
        {STEPS.map((step) => (
          <Text key={step} as="li" fs="p5" color={getToken("text.medium")}>
            {t(`bank.deposit.preparing.steps.${step}`)}
          </Text>
        ))}
      </Stack>
      <Text fs="p5" color={getToken("text.medium")}>
        {t("bank.deposit.preparing.leave")}
      </Text>
    </Stack>
  )
}
