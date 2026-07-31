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
    box-sizing: content-box;
    top: 0;
    left: 0;
    width: 100%;
    height: ${size}px;
    transform: translateY(${start}px);
    border-bottom: 1px solid transparent;

    &:last-of-type {
      border-bottom: none;
    }

    ${bordered &&
    css`
      border-bottom-color: ${theme.details.separators};
    `}
  `,
)
