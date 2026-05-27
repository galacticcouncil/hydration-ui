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

    border-radius: ${theme.radii.xl};
    border: 1px solid ${theme.details.borders};
    background: ${theme.surfaces.containers.high.primary};
  `,
)

export const SProgressContainer = styled.div(
  ({ theme }) => css`
    pointer-events: none;
    height: 100%;
    width: 100%;
    overflow: hidden;

    border-radius: ${theme.radii.xl};

    position: absolute;
    inset: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    &::after {
      content: "";

      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;

      height: ${theme.sizes["4xs"]};
      background: ${theme.buttons.secondary.outline.fill};
    }
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
    info: css`
      ${cssKey}: ${theme.accents.info.onPrimary};
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
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    animation: shrink ${closeTime}ms linear forwards;

    transform-origin: right;

    width: 100%;
    height: ${theme.sizes["4xs"]};

    border-radius: ${theme.radii.full};

    position: relative;
    float: right;
  `,
  getColor("background")(variant),
])

export const SIconVariant = styled(Icon)<{ variant: ToastVariant }>(
  ({ theme, variant }) => [
    css`
      flex-shrink: 0;
      margin-top: ${theme.space.xs};
    `,
    getColor("color")(variant),
  ],
)

export const SCloseIcon = styled(Icon)(
  ({ theme }) => css`
    position: absolute;
    top: -${theme.space.s};
    right: -${theme.space.s};

    color: ${theme.icons.onContainer};
  `,
)
