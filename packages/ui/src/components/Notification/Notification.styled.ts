import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

import { Icon } from "../Icon"

export type ToastVariant =
  | "submitted"
  | "success"
  | "error"
  | "unknown"
  | "warning"

export type CustomToastProps = {
  variant: ToastVariant
  content: string
  className?: string
  onClose?: () => void
  autoClose?: boolean
  autoCloseTimeSC?: number
}

export const SNotification = styled.div(
  ({ theme }) => css`
    display: flex;

    flex-direction: column;
    padding: 16px 24px 16px 8px;

    position: relative;

    width: 310px;

    position: relative;
    overflow: hidden;

    border-radius: 16px;
    border: 1px solid ${theme.details.borders};
    background: ${theme.surfaces.containers.high.primary};
  `,
)

export const SProgressContainer = styled.div(
  ({ theme }) => css`
    height: 2px;
    width: 100%;

    background: ${theme.buttons.secondary.outline.fill};

    position: absolute;
    bottom: 0;
  `,
)

const getColor = (cssKey: "color" | "background") =>
  createVariants((theme) => ({
    success: css`
      ${cssKey}: ${theme.accents.success.emphasis};
    `,
    error: css`
      ${cssKey}: ${theme.accents.danger.secondary};
    `,
    submitted: css`
      ${cssKey}:${theme.text.tint.secondary};
    `,
    unknown: css`
      ${cssKey}: ${theme.icons.onContainer};
    `,
    warning: css`
      ${cssKey}:${theme.accents.alertAlt.primary};
    `,
  }))

export const SProgress = styled.div<{
  closeTime: number
  variant: ToastVariant
}>(({ closeTime, variant }) => [
  css`
    @keyframes shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    animation: shrink ${closeTime}s ease-in-out forwards;

    width: 100%;
    height: 2px;

    border-radius: 9999px;

    position: relative;
    float: right;
  `,
  getColor("background")(variant),
])

export const SIconVariant = styled(Icon)<{ variant: ToastVariant }>(
  ({ variant }) => [getColor("color")(variant)],
)

export const SCloseIcon = styled(Icon)(
  ({ theme }) => css`
    position: absolute;
    top: 4px;
    right: 5px;

    color: ${theme.icons.onContainer};
  `,
)
