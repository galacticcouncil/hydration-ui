import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"

import { Markdown } from "@/components/Markdown"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useAssets } from "@/providers/assetsProvider"

export const StableBondsAbout: React.FC<PaperProps> = (props) => {
  const config = useStableBondsConfig()
  const { getBond } = useAssets()
  const bond = getBond(config.bondId)

  if (!config.contentId || !bond) return null

  return (
    <Paper p="xl" {...props}>
      <SectionHeader title={`About ${bond.symbol}`} as="h2" noTopPadding />
      <Separator mx="-xl" mb="xl" />
      <Markdown id={config.contentId} muted size="small" />
    </Paper>
  )
}
