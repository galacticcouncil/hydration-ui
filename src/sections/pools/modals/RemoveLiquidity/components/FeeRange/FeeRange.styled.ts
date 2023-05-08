import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SFeeRangeContainer = styled.div`
  padding: 2px;

  border-radius: 2px;

  background-color: rgba(${theme.rgbColors.darkBlue400}, 0.4);

  display: flex;
  flex-direction: row;
  gap: 2px;
  align-items: center;
`

export const SFeeRangeItem = styled.div<{
  color: keyof typeof theme.colors
  isActive: boolean
}>`
  border-radius: 2px;

  height: 10px;
  width: 16px;

  background-color: ${(p) =>
    p.isActive ? theme.colors[p.color] : "rgba(135, 139, 163,0.2 )"};
`

export const SFullRangeContainer = styled.div`
  padding: 20px;

  border-radius: 4px;

  background-color: rgba(${theme.rgbColors.darkBlue400}, 0.2);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`

export const SFullFeeRangeContainer = styled.div`
  height: 22px;

  display: flex;
  flex-direction: row;
  gap: 4px;

  margin: 0 6px;
`

export const SFullFeeRangeItem = styled.div<{
  color: keyof typeof theme.colors
  isActive: boolean
}>`
  height: 22px;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  ${(p) => {
    if (p.isActive)
      return css`
        background: rgba(${theme.rgbColors[p.color]}, 0.2);

        position: relative;
        z-index: 9999;

        & > div {
          background: ${theme.colors[p.color]};
          height: 6px;
          width: 100%;
        }
      `
    return css`
      background: rgba(${theme.rgbColors.darkBlue400}, 0.4);

      & > div {
        background: rgba(${theme.rgbColors.darkBlue400}, 0.4);
      }
    `
  }}
`

export const SFeeRangeLine = styled.div`
  width: 100%;

  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;

  display: flex;
  align-items: center;
`

export const SRentagle = styled.div`
  height: 4px;
  width: 4px;

  background-color: rgba(114, 131, 165, 0.6);

  transform: rotate(45deg);
`

export const SLine = styled.div`
  height: 1px;

  background-color: rgba(114, 131, 165, 0.6);

  flex-grow: 1;
`
