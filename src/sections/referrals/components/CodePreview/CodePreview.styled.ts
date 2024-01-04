import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div<{
  disabled: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
    flex-wrap: wrap;
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
  width: 100%;

  @media ${theme.viewport.gte.sm} {
    display: grid;
    gap: 12px 16px;
    grid-template-columns: 2fr 1fr;
  }
`

export const SPreviewBox = styled.div<{ isActive?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 4px;
  flex-wrap: wrap;

  padding: 14px;

  border-radius: ${theme.borderRadius.default}px;
  border: ${({ isActive }) =>
    isActive
      ? `1px dashed rgba(${theme.rgbColors.brightBlue500}, 1)`
      : `1px dashed rgba(${theme.rgbColors.brightBlue100}, 0.35)`};

  @media ${theme.viewport.gte.sm} {
    min-width: 220px;
  }
`

export const SShareBox = styled.div`
  position: relative;
  min-height: 50px;

  width: 100%;

  text-align: center;

  & > button {
    max-width: 200px;
    margin-top: 20px;
  }

  @media ${theme.viewport.gte.md} {
    flex-grow: 1;
    width: auto;

    & > button {
      max-width: none;
    }
  }
`

export const SCopyButton = styled(Button)`
  border-color: transparent !important;

  align-self: center;

  span {
    gap: 4px;
  }
`

export const SPathButton = styled(Button)`
  color: ${({ active }) =>
    active ? theme.colors.basic900 : theme.colors.white};

  padding: 2px 6px;

  background-color: ${({ active }) =>
    active
      ? theme.colors.brightBlue300
      : `rgba(${theme.rgbColors.primaryA15}, 0.12)`};

  border: 0 !important;
`

export const SPreviewPathSelect = styled.div`
  grid-column: span 2;

  display: flex;
  gap: 5px;

  flex-direction: row;
  flex-wrap: wrap;
`
