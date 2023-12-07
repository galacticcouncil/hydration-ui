import styled from "@emotion/styled"
import { theme } from "theme"

export const SSubNavigationContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;

  height: 42px;
  max-width: var(--content-width);

  padding: 0 12px;
  margin: 0 auto;

  overflow-x: scroll;
  overflow-y: hidden;

  ${theme.scrollbarHidden};

  @media (${theme.viewport.gte.sm}) {
    gap: 42px;

    padding: 0 20px;
  }
`

export const STabContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify: space-between;

  height: 100%;

  white-space: nowrap;

  position: relative;
`

export const SBadge = styled.p`
  padding: 2px;

  background: ${theme.colors.pink700};
  color: ${theme.colors.white};

  border-radius: 2px;

  text-transform: uppercase;
  font-size: 7px;
  line-height: 1;
  font-family: ChakraPetchSemiBold;

  position: relative;
  right: 12px;
  top: -8px;
`
