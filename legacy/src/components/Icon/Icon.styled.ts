import styled from "@emotion/styled"
import { ResponsiveValue, getResponsiveStyles } from "utils/responsive"
import { assumePx } from "components/Typography/Typography.utils"

export const SIconWrapper = styled.span<{ size?: ResponsiveValue<number> }>`
  display: flex;
  ${(p) => [
    getResponsiveStyles(p.size, (size) => ({ width: assumePx(size) })),
    getResponsiveStyles(p.size, (size) => ({ height: assumePx(size) })),
  ]}
  & > * {
    ${(p) => [
      getResponsiveStyles(p.size, (size) => ({ width: assumePx(size) })),
      getResponsiveStyles(p.size, (size) => ({ height: assumePx(size) })),
    ]}
  }
`
