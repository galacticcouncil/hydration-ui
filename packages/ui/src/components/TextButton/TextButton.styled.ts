import { css } from "@emotion/react"
import styled from "@emotion/styled"

export type CustomTextButtonProps = {
  variant?: "plain" | "underline"
  direction?: "none" | "internal" | "external"
}

export const STextButton = styled.button<CustomTextButtonProps>(
  ({ theme, variant = "plain", direction = "none" }) => css`
    cursor: pointer;
    font-weight: 500;
    line-height: 120%;

    display: inline-flex;
    ${direction === "external" &&
    css`
      gap: ${theme.space.s};
    `}
    align-items: center;

    transition: ${theme.transitions.colors};

    font-size: ${theme.fontSizes.p5};
    font-family: ${theme.fontFamilies1.secondary};
    border-bottom: ${variant === "underline"
      ? `1px solid ${theme.textButtons.small.rest}`
      : "transparent"};

    color: ${theme.textButtons.small.rest};

    ${variant !== "underline" ? "text-decoration: none" : ""};

    &:hover {
      color: ${theme.textButtons.small.hover};
      border-bottom: ${variant === "underline"
        ? `1px solid ${theme.textButtons.small.hover}`
        : "transparent"};
    }
  `,
)

export const SLinkTextButton = styled.a<CustomTextButtonProps>`
  ${STextButton.__emotion_styles}

  border-bottom: none;
`
