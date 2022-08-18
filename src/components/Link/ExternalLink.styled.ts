import styled from "styled-components/macro"
import { colors } from "common/styles"

export const StyledExternalLink = styled.a`
  text-decoration: underline;
  text-underline-offset: 3px;
  ${colors}
`

export const StyledExternalLinkAdornment = styled.span`
  position: relative;

  svg {
    position: absolute;
    bottom: 2px;
    right: 0;
  }
`
