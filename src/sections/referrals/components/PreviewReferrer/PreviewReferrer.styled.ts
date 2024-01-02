import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ isPopover: boolean }>`
  position: ${({ isPopover }) => (isPopover ? "absolute" : "inherit")};
  z-index: ${theme.zIndices.modal};

  background: ${theme.colors.bg};
  border-radius: ${theme.borderRadius.stakingCard}px;
  border: 1px solid rgba(84, 99, 128, 0.35);
`

export const SBarContainer = styled.div`
  position: relative;

  width: 100%;
  height: 7px;

  margin-top: 3px;

  border-radius: 4px;
  background-color: ${theme.colors.darkBlue401};
`

export const SBar = styled.div<{
  variant: "pink" | "green"
  percentage: number
}>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: calc(100% - ${(p) => p.percentage}%);
  height: 7px;

  border-radius: 4px;
  ${({ variant }) =>
    variant === "green"
      ? css`
          background: linear-gradient(
            270deg,
            ${theme.colors.green600} 50%,
            transparent 100%
          );
        `
      : css`
          background: ${`linear-gradient(
            270deg,
            ${theme.colors.brightBlue600} 0%,
            ${theme.colors.pink600} 100%
          )`};
        `}
`
