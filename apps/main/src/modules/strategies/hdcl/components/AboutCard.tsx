import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { Markdown } from "@/components/Markdown"

export const AboutCard: React.FC<PaperProps> = (props) => {
  const { t } = useTranslation("strategies")
  return (
    <Paper p="xl" {...props}>
      <SectionHeader
        title={t("about.title", {
          suffix: "HDCL",
        })}
        as="h2"
        noTopPadding
      />
      <Separator mx="-xl" mb="xl" />
      <Markdown id="hdcl-vault" muted size="small" />
    </Paper>
  )
}
