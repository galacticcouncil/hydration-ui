import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;
`

export const SVotedBage = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  color: ${theme.colors.basic900};
  background: ${theme.colors.brightBlue600};

  text-transform: uppercase;
  font-size: 13px;
  line-height: normal;
  font-family: GeistSemiBold;

  border-radius: 2px;

  padding: 4px 8px;
`

export const SOpenGovContainer = styled.div<{ type: "staking" | "toast" }>`
  padding: 16px 0px;
  ${({ type }) =>
    type === "toast"
      ? css`
          border-radius: ${theme.borderRadius.default}px;
        `
      : css`
          border-radius: 16px;
          border: 1px solid #372244;

          position: relative;
        `}

  background: #240e32;
`

export const STrackBadge = styled.div`
  display: flex;
  padding: 6px 8px;

  align-items: center;
  gap: 4px;

  border-radius: 32px;

  font-size: 11px;
  text-transform: uppercase;
  color: ${theme.colors.brightBlue100};

  background-color: rgba(133, 209, 255, 0.2);
`

export const SVoteButton = styled.a<{ disabled: boolean }>`
  border-radius: 32px;
  background: #372244;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 82px;
  height: 38px;

  color: ${theme.colors.white};
  font-size: 12px;
  text-transform: uppercase;

  gap: 8px;

  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.8;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
      opacity: 0.2;
    `}
`

export const SProgressBarContainer = styled.div`
  padding: 7px 11px;

  background: rgba(77, 82, 95, 0.1);

  border-radius: 12px;
  border: 1px solid rgba(124, 127, 138, 0.2);
`

export const SThresholdLine = styled.div<{ percentage: string }>`
  position: absolute;
  top: -10px;
  background: #dfb1f3;
  width: 1px;
  height: 32px;
  left: ${({ percentage }) => percentage}%;
`
