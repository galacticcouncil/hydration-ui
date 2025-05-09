import { css, styled } from "@/utils"

export const SMainTabContainer = styled.div<{
  isActive?: boolean
}>(
  ({ theme, isActive }) => css`
    cursor: pointer;

    &:not(:has(svg)) {
      font-family: ${theme.fontFamilies1.secondary};
      font-weight: ${isActive ? 600 : 400};
      font-size: ${theme.paragraphSize.p5};
      line-height: 15px;

      padding: 8px 10px;
      border-radius: 16px;

      &:hover {
        line-height: 1;
      }

      ${isActive
        ? css`
            background: #b3d7fa;
            color: #0d1525;
          `
        : css`
            color: ${theme.text.low};

            &:hover {
              background: #4d525f1a;
              color: ${theme.text.high};
            }
          `}
    }

    &:has(svg) {
      display: flex;
      align-items: center;
      gap: ${theme.buttons.paddings.quart}px;

      font-family: ${theme.fontFamilies1.secondary};
      font-weight: 500;
      font-size: ${theme.paragraphSize.p5};
      line-height: 15px;
      color: ${isActive ? "#0D1525" : theme.text.high};

      padding-block: ${theme.buttons.paddings.primary}px;
      border-radius: 32px;
      line-height: 15px;

      ${isActive
        ? css`
            background: #b3d7fa;
          `
        : css`
            background: ${theme.buttons.outlineDark.rest};

            &:hover {
              background: #4d525f;
            }
          `}

      &:hover {
        color: ${theme.buttons.primary.high.onButton};
      }

      & > svg {
        ${isActive
          ? css`
              color: ${theme.buttons.primary.medium.onButton};
            `
          : css`
              color: ${theme.text.medium};

              &:hover {
                color: ${theme.icons.contrast};
              }
            `}
      }
    }
  `,
)
