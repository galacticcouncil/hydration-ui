import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { CEX_CONFIG } from "@/modules/onramp/config/cex"

import { HowToSteps } from "./HowToSteps"

export type CexDepositGuideProps = { cexId: string }

export const CexDepositGuide: React.FC<CexDepositGuideProps> = ({ cexId }) => {
  const { t } = useTranslation(["onramp"])

  const steps = (() => {
    switch (cexId) {
      case "binance":
        return t("guide.binance.steps", { returnObjects: true })
      case "kucoin":
        return t("guide.kucoin.steps", { returnObjects: true })
      case "gateio":
        return t("guide.gateio.steps", { returnObjects: true })
      case "kraken":
        return t("guide.kraken.steps", { returnObjects: true })
      case "coinbase":
        return t("guide.coinbase.steps", { returnObjects: true })
      default:
        return []
    }
  })()

  if (!steps.length) {
    return null
  }

  const cex = CEX_CONFIG.find(({ id }) => id === cexId)!

  return (
    <Stack gap={12} p={20}>
      <Text
        font="primary"
        fs="p2"
        fw={500}
        color={getToken("text.tint.primary")}
      >
        {t("onramp:guide.title", { cex: cex.title })}
      </Text>
      <HowToSteps steps={steps} />
    </Stack>
  )
}
