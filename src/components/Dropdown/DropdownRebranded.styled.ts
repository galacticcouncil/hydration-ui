import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { theme } from "theme"

export const fadeInKeyframes = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.96);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
`
export const SItem = styled(DropdownMenu.Item)`
  color: rgba(${theme.rgbColors.white}, 0.5);
  font-size: 14px;
  line-height: 26px;

  padding: 0 8px;

  font-weight: 500;

  display: flex;
  align-items: center;
  gap: 10px;

  border-radius: 8px;

  transition: all ${theme.transitions.default};

  cursor: pointer;

  &:focus-visible,
  &:hover {
    outline: none;
    color: ${theme.colors.basic100};
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  svg {
    color: ${theme.colors.pink500};
  }
`
export const SContent = styled(DropdownMenu.Content)`
  display: flex;
  flex-direction: column;
  gap: 4px;

  background: #0d1525;

  border-radius: 12px;

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
  box-shadow: 0px 40px 70px 0px rgba(0, 0, 0, 0.8);

  padding: 10px;

  overflow-y: scroll;
  max-height: 400px;

  z-index: ${theme.zIndices.toast};
`
export const STrigger = styled(DropdownMenu.Trigger)`
  all: unset;

  padding: 8px 14px;

  border-radius: 32px;

  min-width: 12px;
  min-height: 12px;

  background: #0d1525;
  color: ${theme.colors.brightBlue300};

  transition: background ${theme.transitions.default};

  border: 1px solid rgba(124, 127, 138, 0.2);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  overflow: hidden;
  position: relative;

  &:hover {
    opacity: 0.7;
  }

  &[data-state="open"] {
    & > div > span {
      transition: transform ${theme.transitions.default};
      transform: rotate(180deg);
    }
  }

  ${({ disabled }) =>
    disabled &&
    css`
      background: rgba(${theme.rgbColors.basic100}, 0.06);
      color: ${theme.colors.darkBlue300};

      border: 1px solid ${theme.colors.darkBlue300};

      pointer-events: none;
      cursor: not-allowed;
    `}
`
