import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { motion } from "framer-motion"
import { theme } from "theme"
import { ModalHeaderVariant } from "./ModalHeader"

export const SContainer = styled(motion.div)<{
  centered: boolean
  variant?: ModalHeaderVariant
}>`
  position: relative;

  width: calc(
    100% - var(--modal-header-padding-x) - var(--modal-header-btn-size)
  );
  ${({ centered, variant }) =>
    centered &&
    variant !== "gradient" &&
    css`
      width: calc(
        100% - (var(--modal-header-padding-x) + var(--modal-header-btn-size)) *
          2
      );
      margin: 0 auto;
    `}

  ${({ variant }) =>
    variant === "gradient" &&
    css`
      width: 100%;
    `}

  overflow: hidden;
  height: auto;
  min-height: var(--modal-header-height);
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: ${({ centered, variant }) =>
    variant === "gradient" ? "flex-start" : centered ? "center" : "flex-start"};

  padding: var(--modal-header-padding-y) var(--modal-header-padding-x);
`

export const STitleGradient = styled(GradientText)`
  margin-top: calc(
    var(--modal-header-height) - var(--modal-header-padding-y) * 2 + 16px
  );

  font-size: 17px;
  font-weight: 500;
  font-family: "FontOver", sans-serif;

  background: ${theme.gradients.pinkLightBlue};
  background-clip: text;

  @media ${theme.viewport.gte.sm} {
    font-size: 24px;
  }
`

export const SButtonContainer = styled(motion.div)<{
  position: "left" | "right"
  headerVariant?: ModalHeaderVariant
}>`
  position: absolute;
  top: var(--modal-header-padding-y);
  ${({ position }) => {
    if (position === "left") return "left: var(--modal-header-padding-x);"
    if (position === "right") return "right: var(--modal-header-padding-x);"
  }}
`

export const SButton = styled(IconButton)`
  width: var(--modal-header-btn-size);
  height: var(--modal-header-btn-size);
  min-width: var(--modal-header-btn-size);
  min-height: var(--modal-header-btn-size);

  svg {
    color: ${theme.colors.white};
    width: calc(var(--modal-header-btn-size) - 6px);
    height: calc(var(--modal-header-btn-size) - 6px);
  }
`
