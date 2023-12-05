import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SPreviewBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  gap: 4px;

  position: relative;

  padding: 14px 120px 14px 16px;

  border-radius: ${theme.borderRadius.default}px;
  border: 1px dashed rgba(${theme.rgbColors.brightBlue100}, 0.35);
`

export const SCopyButton = styled(Button)`
  position: absolute;

  border-color: transparent !important;

  right: 16px;
  top: 50%;

  transform: translateY(-50%) !important;
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
