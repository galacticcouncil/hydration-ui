import { Close, Root, Title } from "@radix-ui/react-toast"
import styled from "@emotion/styled"
import { theme } from "theme"
import { motion } from "framer-motion"
import { css, SerializedStyles } from "@emotion/react"
import { ToastVariant } from "./Toast"

export const SRoot = styled(motion(Root))`
  position: relative;
  width: 384px;

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

export const SContainer = styled.div<{ variant: ToastVariant }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
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

export const SContent = styled(Title)`
  display: flex;
  align-items: center;
`

export const SCounter = styled.div`
  margin-top: auto;
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
    background: rgba(${theme.rgbColors.brightBlue100}, 0.39);
    border: 1px solid rgba(${theme.rgbColors.brightBlue200}, 0.39);
  }
`

export const SProgressBarBg = styled.div`
  background: ${theme.colors.basic700};

  width: 100%;
  height: 1px;

  position: absolute;
  bottom: 0;
  left: 0;
`

export const SProgressBar = styled(motion.div)<{
  variant: ToastVariant
}>`
  position: absolute;
  bottom: 0;
  left: 0;

  height: 2px;
  background: ${({ variant }) => variantProgressBarBg[variant]};
`

export const Shadow = styled.div<{ variant: ToastVariant }>`
  margin-top: 5px;
  height: 0px;

  -webkit-box-shadow: 0px 20px 15px 4px rgb(219 26 26);
  -moz-box-shadow: 0px 20px 15px 4px rgb(219 26 26);
  box-shadow: 0px 20px 15px 4px
    ${({ variant }) => variantProgressBarBg[variant]};
`

const variantBg: Record<ToastVariant, SerializedStyles> = {
  success: css`
    background: rgba(${theme.rgbColors.green100}, 0.25);
  `,
  info: css`
    background: rgba(${theme.rgbColors.brightBlue200}, 0.2);
  `,
  error: css`
    background: rgba(${theme.rgbColors.red100}, 0.25);
  `,
  loading: css`
    background: rgba(${theme.rgbColors.brightBlue200}, 0.2);
  `,
}

const variantProgressBarBg: Record<ToastVariant, string> = {
  success: theme.colors.green600,
  info: theme.colors.brightBlue700,
  error: theme.colors.red700,
  loading: theme.colors.brightBlue700,
}
