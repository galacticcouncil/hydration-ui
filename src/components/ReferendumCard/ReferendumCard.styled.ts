import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ type: "staking" | "toast" }>`
  padding: 16px;
  ${({ type }) =>
    type === "toast"
      ? css`
          background: rgba(${theme.rgbColors.darkBlue401}, 0.8);

          border-radius: ${theme.borderRadius.default}px;
        `
      : css`
          background: ${theme.colors.darkBlue700};

          border-radius: ${theme.borderRadius.stakingCard}px;

          position: relative;

          :before {
            content: "";
            position: absolute;
            inset: 0;

            border-radius: ${theme.borderRadius.stakingCard}px;
            padding: 1px; // a width of the border

            background: linear-gradient(
              180deg,
              rgba(152, 176, 214, 0.27) 0%,
              rgba(163, 177, 199, 0.15) 66.67%,
              rgba(158, 167, 180, 0.2) 100%
            );
            -webkit-mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }
        `}
`

export const SHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const SBar = styled.div<{ variant: "aye" | "nay"; percentage: number }>`
  height: 4px;
  width: ${({ percentage }) => percentage}%;

  border-radius: 4px;
  ${({ variant }) =>
    variant === "aye"
      ? css`
          background: linear-gradient(
            270deg,
            ${theme.colors.green600} 50%,
            transparent 100%
          );
        `
      : css`
          background: linear-gradient(
            90deg,
            ${theme.colors.pink700} 50%,
            transparent 100%
          );
        `}
`
