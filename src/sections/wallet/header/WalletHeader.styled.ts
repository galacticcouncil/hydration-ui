import styled from "@emotion/styled"
import { theme } from "theme"

export const SWalletHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aligh-items: start;

  padding: 15px 12px;
  margin: -15px -12px 0;

  background: rgba(0, 5, 35, 0.2);

  @media (${theme.viewport.gte.sm}) {
    flex-direction: row;
    aligh-items: center;

    padding-bottom: 0 0 16px 0;

    background: transparent;
  }
`
