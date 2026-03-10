import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

const bottomPinnedStyle = css`
  position: fixed;
  right: 0;
  bottom: 0;
  padding-bottom: 8px;
  z-index: 1001;
`

export const SContainer = styled.div<{ readonly bottomPinned?: boolean }>(
  ({ bottomPinned }) => css`
    padding: 8px;
    padding-bottom: 80px;

    ${bottomPinned
      ? bottomPinnedStyle
      : css`
          display: flex;
          justify-content: end;
        `}

    ${mq("lg")} {
      ${bottomPinnedStyle}
    }
  `,
)
