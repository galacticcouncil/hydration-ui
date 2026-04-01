import { Theme } from "@emotion/react"
import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

const bottomPinnedStyle = (theme: Theme) => css`
  position: fixed;
  bottom: 0;
  padding-bottom: ${theme.space.base};
  z-index: 1001;
`

export const SFooter = styled(Flex)<{ readonly bottomPinned?: boolean }>(
  ({ theme, bottomPinned }) => css`
    gap: ${theme.space.base};
    padding: ${theme.space.base};
    padding-bottom: ${pxToRem(80)};

    width: 100%;

    ${bottomPinned
      ? bottomPinnedStyle(theme)
      : css`
          display: flex;
        `}

    ${mq("lg")} {
      ${bottomPinnedStyle(theme)}
    }
  `,
)
