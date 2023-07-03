import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  padding: 16px;

  background: rgba(${theme.rgbColors.darkBlue401}, 0.8);
  border-radius: 4px;
`

export const SHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const SBar = styled.div<{ variant: "aye" | "nay"; percentage: number }>`
  height: 10px;
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
