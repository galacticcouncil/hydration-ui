import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { m as motion } from "framer-motion"
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ centered, variant }) =>
    variant === "gradient" ? "flex-start" : centered ? "center" : "flex-start"};

  padding: var(--modal-header-padding-y) var(--modal-header-padding-x);

  > p {
    text-align: ${({ centered, variant }) =>
      centered && variant !== "gradient" ? "center" : "left"};
    width: 100%;
  }
`

export const STitleGradient = styled(GradientText)`
  margin-top: calc(
    var(--modal-header-height) - var(--modal-header-padding-y) * 2 + 8px
  );

  font-size: 18px;
  font-weight: 500;
  font-family: "GeistMonoSemiBold", sans-serif;

  background: ${theme.gradients.pinkLightBlue};
  background-clip: text;

  @media ${theme.viewport.gte.sm} {
    font-size: 22px;
  }
`

export const SButtonContainer = styled(motion.div)<{
  position: "left" | "right"
  headerVariant?: ModalHeaderVariant
}>`
  position: absolute;
  top: calc(var(--modal-header-padding-y) / 2);
  ${({ position }) => {
    if (position === "left")
      return "left: calc(var(--modal-header-padding-x) / 2);"
    if (position === "right")
      return "right: calc(var(--modal-header-padding-x) / 2);"
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
