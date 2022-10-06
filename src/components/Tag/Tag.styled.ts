import { Box } from "components/Box/Box"
import styled from "@emotion/styled"
import { theme } from "theme"

export const STag = styled(Box)`
  display: inline-flex;
  width: auto;

  background: ${theme.gradients.primaryGradient};
  padding: 3px 6px;
  border-radius: 4px;
`
