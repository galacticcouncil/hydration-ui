import { Box } from "components/Box/Box"
import styled from "styled-components"
import { theme } from "theme"

export const STag = styled(Box)`
  display: inline-flex;
  width: auto;

  background: ${theme.gradients.primaryGradient};
  padding: 4px 6px 2px;
  border-radius: 4px;
`
