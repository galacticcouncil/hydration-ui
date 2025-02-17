import styled from "@emotion/styled"
import { Flex } from "@galacticcouncil/ui/components"

export const SHeader = styled(Flex)`
  width: 100%;
  padding: 10px 30px;
  gap: 40px;
  align-items: center;

  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.details.separators};

  background: ${({ theme }) => theme.surfaces.themeBasePalette.background};
`
