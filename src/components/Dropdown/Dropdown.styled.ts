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
  color: ${theme.colors.basic100};
  font-size: 14px;
  line-height: 18px;

  padding: 18px;
  padding-left: 20px;
  padding-right: 40px;

  font-weight: 500;

  display: flex;
  align-items: center;
  gap: 10px;

  background: transparent;

  transition: all ${theme.transitions.default};

  cursor: pointer;

  &:not(:last-of-type) {
    border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  }

  &:focus-visible,
  &:hover {
    outline: none;
    background: rgba(${theme.rgbColors.white}, 0.03);
  }

  &:first-of-type {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  svg {
    color: ${theme.colors.pink500};
  }
`
export const SContent = styled(DropdownMenu.Content)`
  background: rgba(255, 3, 103, 0.27);
  backdrop-filter: blur(20px);

  border-radius: 4px;

  border: 1px solid ${theme.colors.pink500};

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
  box-shadow: 0px 17px 44px rgba(0, 0, 0, 0.54);

  z-index: ${theme.zIndices.toast};
`
export const STrigger = styled(DropdownMenu.Trigger)`
  all: unset;

  border-radius: 4px;

  min-width: 36px;
  min-height: 36px;

  background: rgba(${theme.rgbColors.primaryA15}, 0.12);
  color: ${theme.colors.brightBlue300};

  transition: background ${theme.transitions.default};

  border: 1px solid ${theme.colors.brightBlue300};

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  overflow: hidden;
  position: relative;

  &:hover {
    color: ${theme.colors.white};
    background: rgba(${theme.rgbColors.brightBlue500}, 0.9);
    border: 1px solid rgba(${theme.rgbColors.brightBlue200}, 0.39);
  }

  &[data-state="open"] {
    background: ${theme.colors.brightBlue400};
    color: ${theme.colors.white};
    border: 1px solid ${theme.colors.brightBlue100};
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
