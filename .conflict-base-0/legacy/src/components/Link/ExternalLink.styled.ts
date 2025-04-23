import styled from "@emotion/styled"

export const SExternalLink = styled.a`
  text-decoration: underline;
  text-underline-offset: 3px;
`

export const SExternalLinkAdornment = styled.span`
  position: relative;

  svg {
    position: absolute;
    bottom: 2px;
    right: 0;
  }
`
