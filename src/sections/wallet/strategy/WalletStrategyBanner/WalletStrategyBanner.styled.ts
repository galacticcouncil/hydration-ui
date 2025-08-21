import styled from "@emotion/styled"
import { theme } from "theme"

import background from "./assets/background.svg"

export const SWalletStrategyBanner = styled.div`
  position: relative;

  display: flex;
  align-items: start;
  justify-content: space-between;
  flex-direction: column;

  gap: 8px;

  padding-block: 12px;
  padding-left: 90px;
  padding-right: 12px;

  border: 1px solid ${theme.colors.darkBlue400};
  border-radius: 8px;

  background: linear-gradient(89.8deg, #ff268b 0.05%, rgba(196, 6, 85, 0) 42%);

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
    align-items: center;

    height: 89px;
    padding-left: 125px;
    padding-right: 40px;

    background: linear-gradient(
      89.8deg,
      #ff268b 0.05%,
      rgba(196, 6, 85, 0) 74.93%
    );

    &:before {
      content: "";
      position: absolute;
      inset: 0;
      background: center left url(${background}) no-repeat;
      pointer-events: none;
    }
  }
`

export const SCansImage = styled.img`
  position: absolute;

  top: 4px;
  left: 14px;

  width: 55px;
  height: auto;

  @media ${theme.viewport.gte.sm} {
    top: -12px;
    width: 90px;
    left: 20px;
  }
`
