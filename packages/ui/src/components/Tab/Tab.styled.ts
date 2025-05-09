import { createVariants, css, styled } from "@/utils"

export type TabSize = "small" | "large"

const sizes = createVariants<TabSize>((theme) => ({
  small: css`
    padding: 8px 10px;
    border-radius: ${theme.buttons.paddings.primary}px;

    font-size: 11px;
    line-height: 15px;
  `,
  large: css`
    padding: ${theme.buttons.paddings.secondary}px
      ${theme.buttons.paddings.primary}px;
    border-radius: 32px;

    font-size: ${theme.paragraphSize.p5};
    line-height: 1.2;
  `,
}))

export const STab = styled.div<{
  readonly size?: TabSize
  readonly isActive?: boolean
}>(({ theme, size = "small", isActive }) => [
  css`
    display: flex;
    align-items: center;
    justify-content: center;

    max-width: fit-content;
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;

    cursor: pointer;

    ${isActive
      ? css`
          color: ${theme.buttons.outlineDark.onActive};
          background: ${theme.buttons.outlineDark.active};
        `
      : css`
          color: ${theme.text.medium};
          background: ${theme.buttons.outlineDark.rest};

          &:hover {
            background: ${theme.buttons.outlineDark.hover};
            color: ${theme.text.high};
          }
        `}
  `,
  sizes(size),
])
