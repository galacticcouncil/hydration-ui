import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"
import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"

export const AboutCard: React.FC<PaperProps> = (props) => {
  const { t } = useTranslation("strategies")
  const { bil } = useBilStrategy()
  return (
    <Paper p="xl" {...props}>
      <SectionHeader
        title={t("about.title", {
          suffix: bil.symbol,
        })}
        as="h2"
        noTopPadding
      />
      <Separator mx="-xl" mb="xl" />
      <Markdown id="bil-vault" muted size="small" />
    </Paper>
  )
}
