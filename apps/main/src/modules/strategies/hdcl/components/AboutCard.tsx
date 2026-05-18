import { Paper, PaperProps } from "@galacticcouncil/ui/components"

import { Markdown } from "@/components/Markdown"

export const AboutCard: React.FC<PaperProps> = (props) => {
  return (
    <Paper p="xl" {...props}>
      <Markdown id="HDCL" muted size="small" />
    </Paper>
  )
}
