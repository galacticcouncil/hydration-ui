import { css } from "@emotion/react"
import styled from "@emotion/styled"

export type CustomTextButtonProps = {
  variant?: "plain" | "underline"
  direction?: "none" | "internal" | "external"
}

export const STextButton = styled.p<CustomTextButtonProps>(
  ({ theme, variant = "plain" }) => css`
    cursor: pointer;
    font-weight: 500;
    line-height: 120%;

    display: inline-flex;
    align-items: center;

    transition: all 0.15s ease-in-out;

    font-size: ${theme.paragraphSize.p5};
    font-family: ${theme.fontFamilies1.secondary};
    border-bottom: ${variant === "underline"
      ? `1px solid ${theme.text.medium}`
      : "transaprent"};

    color: ${theme.text.medium};

    &:hover {
      color: ${theme.buttons.primary.medium.rest};
      border-bottom: ${variant === "underline"
        ? `1px solid ${theme.buttons.primary.medium.rest}`
        : "transaprent"};
    }
  `,
)

export const SLinkTextButton = STextButton.withComponent("a")
