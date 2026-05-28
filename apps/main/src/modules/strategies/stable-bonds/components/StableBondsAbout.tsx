import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useAssets } from "@/providers/assetsProvider"

export const StableBondsAbout: React.FC<PaperProps> = (props) => {
  const { t } = useTranslation("strategies")
  const config = useStableBondsConfig()
  const { getBond, getAssetWithFallback } = useAssets()
  const bond = getBond(config.bondId)

  if (!config.contentId || !bond) return null

  const underlyingAsset = getAssetWithFallback(bond.underlyingAssetId)

  return (
    <Paper p="xl" {...props}>
      <SectionHeader
        title={t("about.title", {
          suffix: t("bonds.title.stableYieldBonds", {
            symbol: underlyingAsset.symbol,
          }),
        })}
        as="h2"
        noTopPadding
      />
      <Separator mx="-xl" mb="xl" />
      <Markdown id={config.contentId} muted size="small" />
    </Paper>
  )
}
