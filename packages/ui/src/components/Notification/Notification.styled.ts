import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { isPropValid } from "storybook/theming"

import { createVariants } from "@/utils"

import { Icon } from "../Icon"
import { ToastVariant } from "./Notification"

export const SNotification = styled("div", {
  shouldForwardProp: (prop: string) =>
    isPropValid(prop) && prop !== "fullWidth",
})<{ fullWidth?: boolean }>(
  ({ theme, fullWidth }) => css`
    display: flex;

    flex-direction: column;
    padding-block: ${theme.space.l};
    padding-inline: ${theme.space.m};

    position: relative;

    width: ${fullWidth ? "100%" : "19.375rem"};

    position: relative;
    overflow: hidden;

    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.details.borders};
    background: ${theme.surfaces.containers.high.primary};
  `,
)

export const SProgressContainer = styled.div(
  ({ theme }) => css`
    height: ${theme.sizes["4xs"]};
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
    pending: css`
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
}>(({ theme, closeTime, variant }) => [
  css`
    @keyframes shrink {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    animation: shrink ${closeTime}ms linear forwards;

    width: 100%;
    height: ${theme.sizes["4xs"]};

    border-radius: ${theme.radii.full};

    position: relative;
    float: right;
  `,
  getColor("background")(variant),
])

export const SIconVariant = styled(Icon)<{ variant: ToastVariant }>(
  ({ variant }) => [
    css`
      flex-shrink: 0;
    `,
    getColor("color")(variant),
  ],
)

export const SCloseIcon = styled(Icon)(
  ({ theme }) => css`
    position: absolute;
    top: 4px;
    right: 5px;

    color: ${theme.icons.onContainer};
  `,
)
