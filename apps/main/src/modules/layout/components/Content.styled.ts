import styled from "@emotion/styled"
import { Box } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SContent = styled(Box)`
  --layout-gutter: 8px;
  --layout-bottom-safe-area: 10px;
  ${mq("lg")} {
    --layout-gutter: 30px;
    --layout-bottom-safe-area: 40px;
  }

  max-width: 1160px;

  margin: 0 auto;

  padding-top: 20px;
  padding-bottom: var(--layout-bottom-safe-area);
  padding-inline: var(--layout-gutter);
`
