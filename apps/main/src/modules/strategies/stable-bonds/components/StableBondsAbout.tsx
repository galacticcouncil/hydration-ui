import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { millisecondsInDay } from "date-fns/constants"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { Markdown } from "@/components/Markdown"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useAssets } from "@/providers/assetsProvider"

export const StableBondsAbout: React.FC<PaperProps> = (props) => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()
  const { getBond, getAssetWithFallback } = useAssets()
  const bond = getBond(config.bondId)
  const { timeLeft } = useBondData(config.bondId)

  if (!config.contentId || !bond) return null

  const underlyingAsset = getAssetWithFallback(bond.underlyingAssetId)
  const apr = getBondApr(config.bondId, timeLeft)

  return (
    <Paper p="xl" {...props}>
      <SectionHeader
        title={t("strategies:about.title", {
          suffix: t("strategies:bonds.title.stableYieldBonds", {
            symbol: underlyingAsset.symbol,
          }),
        })}
        as="h2"
        noTopPadding
      />
      <Separator mx="-xl" mb="xl" />
      <Markdown
        id={config.contentId}
        muted
        size="small"
        values={{
          daysLeft: t("interval", {
            value: timeLeft,
            largest: 1,
            ...(timeLeft > millisecondsInDay && { unit: "d" }),
          }),
          apr: apr
            ? t("common:percent", { value: apr, minimumFractionDigits: 2 })
            : "",
        }}
      />
    </Paper>
  )
}
