import styled from "@emotion/styled"
import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"

export const SHeader = styled(Flex)`
  padding: 10px 20px;
  gap: 20px;
  flex-direction: column;
  align-items: center;

  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.details.separators};

  background: ${({ theme }) => theme.surfaces.themeBasePalette.background};

  ${mq("md")} {
    padding: 10px 30px;
    gap: 40px;
    flex-direction: row;
  }
`
