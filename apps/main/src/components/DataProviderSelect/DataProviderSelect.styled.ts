import { css, Theme } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"

const bottomPinnedStyle = (theme: Theme) => css`
  position: fixed;
  right: 0;
  bottom: 0;
  padding-bottom: ${theme.space.base};
  z-index: 1001;
`

export const SContainer = styled.div<{ readonly bottomPinned?: boolean }>(
  ({ theme, bottomPinned }) => css`
    display: flex;

    /* 8px gap + 20px vertical padding (design tokens); horizontal stays base. */
    gap: ${theme.sizes["2xs"]};
    padding-top: ${theme.sizes.l};
    padding-bottom: ${pxToRem(80)};
    padding-inline: ${theme.space.base};

    ${bottomPinned
      ? bottomPinnedStyle(theme)
      : css`
          display: flex;
          justify-content: end;
        `}

    ${mq("lg")} {
      ${bottomPinnedStyle(theme)}
    }
  `,
)
