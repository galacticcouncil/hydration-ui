import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { SContainer } from "sections/staking/StakingPage.styled"
import { theme } from "theme"

export const SStakeTab = styled.div<{ active: boolean }>`
  padding: 16px 16px 13px;

  border-radius: ${theme.borderRadius.medium}px ${theme.borderRadius.medium}px 0
    0;

  font-family: GeistMono;
  font-size: 15px;
  text-transform: capitalize;
  text-align: center;

  cursor: pointer;

  position: relative;

  flex: 1;

  ${(p) =>
    p.active
      ? css`
          & > p {
            background: ${theme.gradients.pinkLightBlue};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            width: min-content;

            margin: auto;
          }

          //background: ${theme.colors.darkBlue700};

          :before {
            content: "";
            position: absolute;
            inset: 0;

            border-radius: ${theme.borderRadius.medium}px
              ${theme.borderRadius.medium}px 0 0;
            padding: 1px; // a width of the border
            padding-bottom: 0;

            background: linear-gradient(
              180deg,
              rgba(152, 176, 214, 0.56) 0%,
              rgba(163, 177, 199, 0.15) 66.67%,
              rgba(158, 167, 180, 0) 100%
            );

            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
        `
      : css`
          color: ${theme.colors.basic600};
        `}
`

export const SSectionContainer = styled(SContainer)`
  background: ${theme.colors.darkBlue700};
  gap: 0px;

  :before {
    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    );

    padding-top: 0;
  }
`

export const SSectionHeader = styled.div`
  display: flex;

  width: 100%;

  //background: #0a0c17;

  border-radius: 4px 4px 0 0;
`
