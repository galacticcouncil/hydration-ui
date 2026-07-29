import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { CexId } from "@/modules/onramp/types"

import { HowToSteps } from "./HowToSteps"

export type CexDepositGuideProps = { cexId: CexId }

export const CexDepositGuide: React.FC<CexDepositGuideProps> = ({ cexId }) => {
  const { t } = useTranslation(["onramp"])

  const steps = t(`guide.${cexId}.steps`, { returnObjects: true })

  if (!steps) {
    return null
  }

  return (
    <Stack gap="m" p="xl">
      <Text
        font="primary"
        fs="p2"
        fw={500}
        color={getToken("text.tint.primary")}
      >
        {t("onramp:guide.title", { cex: t(`cex.${cexId}.title`) })}
      </Text>
      <HowToSteps steps={steps} />
    </Stack>
  )
}
