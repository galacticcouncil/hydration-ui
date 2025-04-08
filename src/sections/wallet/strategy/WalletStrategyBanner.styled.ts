import styled from "@emotion/styled"
import { theme } from "theme"

export const SWalletStrategyBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 89px;

  padding-block: 25px;
  padding-left: 8px;
  padding-right: 40px;

  border: 1px solid ${theme.colors.darkBlue400};
  border-radius: 8px;

  background: linear-gradient(
    89.8deg,
    #ff268b 0.05%,
    rgba(196, 6, 85, 0) 74.93%
  );
`
