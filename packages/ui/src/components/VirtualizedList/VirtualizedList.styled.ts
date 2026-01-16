import { Box } from "@/components/Box"
import { css, styled } from "@/utils"

export const SList = styled(Box)`
  width: 100%;
  position: relative;
`

export const SListItem = styled("div", {
  shouldForwardProp: (prop) =>
    prop !== "size" && prop !== "start" && prop !== "bordered",
})<{ size: number; start: number; bordered: boolean }>(
  ({ theme, size, start, bordered }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: ${size}px;
    transform: translateY(${start}px);

    ${bordered &&
    css`
      border-bottom: 1px solid ${theme.details.separators};
      &:last-of-type {
        border-bottom: none;
      }
    `}
  `,
)
