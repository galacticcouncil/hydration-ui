import { Box } from "@/components/Box"
import { styled } from "@/utils"

export const SList = styled(Box)`
  width: 100%;
  position: relative;
`

export const SListItem = styled("div", {
  shouldForwardProp: (props) => props !== "size" && props !== "start",
})<{ size: number; start: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${({ size }) => size}px;
  transform: translateY(${({ start }) => start}px);
`
