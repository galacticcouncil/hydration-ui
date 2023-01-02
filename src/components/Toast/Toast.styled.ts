import { Close, Root, Title } from "@radix-ui/react-toast"
import styled from "@emotion/styled"
import { theme } from "theme"
import { motion } from "framer-motion"
import { Maybe } from "utils/helpers"
import { css, SerializedStyles } from "@emotion/react"
import { ToastVariant } from "state/toasts"

export const SRoot = styled(Root)`
  position: relative;
  width: 384px;

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

export const SContainer = styled.div<{ variant: ToastVariant }>`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 14px;

  position: relative;
  overflow: hidden;

  padding: 14px;

  border-radius: 2px;
  backdrop-filter: blur(10px);

  ${({ variant }) => variantBg[variant]};
`

export const SIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`

export const STitle = styled(Title)`
  display: flex;

  font-weight: 500;
  font-size: 12px;
  color: ${theme.colors.basic400};
  & .highlight {
    color: ${theme.colors.white};
  }
`

export const SClose = styled(Close)`
  min-width: 24px;
  min-height: 24px;

  color: ${theme.colors.white};
  background: #0e132f;
  transition: background ${theme.transitions.default};

  position: absolute;
  top: -12px;
  right: -8px;
  overflow: hidden;

  border: 1px solid #30344c;
  border-radius: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  padding: 0;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: ${theme.colors.white};
    border: 1px solid rgba(${theme.rgbColors.brightBlue200}, 0.39);
  }
`

export const SProgressContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  height: 2px;
  background: ${theme.colors.basic700};

  transform: rotate(180deg);
`

export const SProgressBar = styled(motion.div)<{
  variant: Maybe<ToastVariant>
}>`
  height: 2px;

  background: ${({ variant }) => variant && variantProgressBarBg[variant]};
`

const variantBg: Record<ToastVariant, SerializedStyles> = {
  success: css`
    background: rgba(${theme.rgbColors.green100}, 0.25);
  `,
  info: css`
    background: rgba(${theme.rgbColors.primaryA20}, 0.2);
  `,
  error: css`
    background: rgba(${theme.rgbColors.red100}, 0.25);
  `,
  progress: css`
    background: rgba(${theme.rgbColors.primaryA20}, 0.2);
  `,
}

export const Shadow = styled.div<{ variant: ToastVariant }>`
  margin-top: 5px;
  height: 0px;

  -webkit-box-shadow: 0px 20px 15px 4px rgb(219 26 26);
  -moz-box-shadow: 0px 20px 15px 4px rgb(219 26 26);
  box-shadow: 0px 20px 15px 4px
    ${({ variant }) => variantProgressBarBg[variant]};
`

const variantProgressBarBg: Record<ToastVariant, string> = {
  success: theme.colors.green600,
  info: theme.colors.brightBlue700,
  error: theme.colors.red700,
  progress: theme.colors.brightBlue700,
}

export const ToastContentWrapper = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: ${theme.colors.basic400};
  & .highlight {
    color: ${theme.colors.white};
  }
`
