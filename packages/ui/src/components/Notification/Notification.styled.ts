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
  onClose: () => void
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
    border: 1px solid ${theme.Details.borders};
    background: ${theme.Surfaces.containers.High.Primary};
  `,
)

export const SProgressContainer = styled.div(
  ({ theme }) => css`
    height: 2px;
    width: 100%;

    background: ${theme.Buttons.Secondary.Outline.Fill};

    position: absolute;
    bottom: 0;
  `,
)

const getColor = (cssKey: "color" | "background") =>
  createVariants((theme) => ({
    success: css`
      ${cssKey}: ${theme.Accents.success.onPrimary};
    `,
    error: css`
      ${cssKey}: ${theme.Accents.Danger.Primary};
    `,
    submitted: css`
      ${cssKey}:${theme.Buttons.Primary.Medium.Rest};
    `,
    unknown: css`
      ${cssKey}: ${theme.Colors.greys[300]};
    `,
    warning: css`
      ${cssKey}:${theme.Colors.utility["warning-yellow"][500]};
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

    color: ${theme.Icons.onContainer};
  `,
)
