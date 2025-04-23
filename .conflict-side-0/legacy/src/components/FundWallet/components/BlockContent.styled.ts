import styled from "@emotion/styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

export const SBlockDescription = styled(Text)`
  grid-column: span 2;

  @media ${theme.viewport.gte.sm} {
    grid-column: initial;
  }
`
export const SBlockContent = styled.div`
  display: grid;

  row-gap: 10px;

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: 2fr 1fr;
  }
`
export const SLinkText = styled(Text)`
  white-space: nowrap;
`

export const SBlockLink = styled.div`
  order: 1;

  a::before {
    content: "";
    position: absolute;
    inset: 0;
  }

  @media ${theme.viewport.gte.sm} {
    order: 0;
    justify-self: end;
    align-self: center;
    grid-row: span 2;
  }
`

export const SLinkContent = styled.div`
  display: flex;
  color: ${theme.colors.white};
  align-items: center;
  column-gap: 3px;
`
