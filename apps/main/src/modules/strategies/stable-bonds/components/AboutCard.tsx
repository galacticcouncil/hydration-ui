import {
  Paper,
  PaperProps,
  SectionHeader,
  Separator,
} from "@galacticcouncil/ui/components"

import { Markdown } from "@/components/Markdown"

export const AboutCard: React.FC<PaperProps> = (props) => {
  return (
    <Paper p="xl" {...props}>
      <SectionHeader title="About HOLLARb" as="h2" noTopPadding />
      <Separator mx="-xl" mb="xl" />
      <Markdown id="stable-bonds" muted size="small" />
    </Paper>
  )
}
