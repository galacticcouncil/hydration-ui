import styled from "@emotion/styled"
import { SContainerVertical } from "../StatsLRNA.styled"
import { theme } from "theme"

export const SBurnContainer = styled(SContainerVertical)`
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  padding: 40px;

  @media (${theme.viewport.gte.sm}) {
    flex-direction: row;

    & > div:nth-child(1) {
      order: 2;
    }
    & > div:nth-child(2) {
      order: 1;
    }
    & > div:nth-child(3) {
      order: 3;
    }
  }

  & p {
    text-align: center;
  }
`
