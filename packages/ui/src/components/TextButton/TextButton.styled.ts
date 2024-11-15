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
    font-family: ${theme.fontFamilies1.Secondary};
    border-bottom: ${variant === "underline"
      ? `1px solid ${theme.Text.Medium}`
      : "transaprent"};

    color: ${theme.Text.Medium};

    &:hover {
      color: ${theme.Buttons.Primary.Medium.Rest};
      border-bottom: ${variant === "underline"
        ? `1px solid ${theme.Buttons.Primary.Medium.Rest}`
        : "transaprent"};
    }
  `,
)

export const SLinkTextButton = STextButton.withComponent("a")
