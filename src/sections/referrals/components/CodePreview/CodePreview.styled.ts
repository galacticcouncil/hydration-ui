import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div<{
  disabled: boolean
}>`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 16px;

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.3;
      pointer-events: none;
      user-select: none;
    `}
`

export const SPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 16px;

  flex: 1;

  @media ${theme.viewport.gte.sm} {
    gap: 12px 16px;
    flex-direction: row;
    flex-wrap: nowrap;
  }
`

export const SPreviewBox = styled.div<{ isActive?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 4px;

  white-space: nowrap;

  padding: 14px;

  border-radius: ${theme.borderRadius.default}px;
  border: ${({ isActive }) =>
    isActive
      ? `1px dashed rgba(${theme.rgbColors.brightBlue500}, 1)`
      : `1px dashed rgba(${theme.rgbColors.brightBlue100}, 0.35)`};

  @media ${theme.viewport.gte.sm} {
    min-width: 240px;
  }
`

export const SShareBox = styled.div`
  position: relative;
  white-space: nowrap;
  text-align: center;

  min-width: 160px;

  display: flex;
  align-items: center;
`

export const SCopyButton = styled(Button)`
  border-color: transparent !important;

  align-self: center;

  span {
    gap: 4px;
  }
`
