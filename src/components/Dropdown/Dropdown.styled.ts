import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { theme } from "theme"

const fadeInKeyframes = keyframes`
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
  color: ${theme.colors.primary200};
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
`
export const SContent = styled(DropdownMenu.Content)`
  background: rgba(${theme.rgbColors.primary450}, 0.12);
  backdrop-filter: blur(20px);

  border-radius: 12px;

  animation: 150ms cubic-bezier(0.16, 1, 0.3, 1) ${fadeInKeyframes};
  box-shadow: 0px 40px 70px rgba(0, 0, 0, 0.4);

  z-index: ${theme.zIndices.toast};
`
export const STrigger = styled(DropdownMenu.Trigger)`
  all: unset;

  color: ${theme.colors.primary400};
  background: rgba(${theme.rgbColors.white}, 0.06);

  display: flex;
  width: 34px;
  height: 34px;

  border-radius: 9999px;

  :focus-visible {
    outline: none;
  }

  transition: all ${theme.transitions.default};

  &[data-state="open"] {
    background: rgba(${theme.rgbColors.primary450}, 0.12);
  }

  ${({ disabled }) => {
    if (disabled) {
      return css`
        background: rgba(${theme.rgbColors.primary100}, 0.06);
        color: rgba(${theme.rgbColors.white}, 0.6);
        pointer-events: none;
      `
    }

    return null
  }}
`
