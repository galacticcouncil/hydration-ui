import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ isPopover: boolean }>`
  position: ${({ isPopover }) => (isPopover ? "absolute" : "inherit")};
  z-index: ${theme.zIndices.modal};

  background: ${theme.colors.bg};
  border-radius: ${theme.borderRadius.medium}px;
  border: 1px solid rgba(84, 99, 128, 0.35);
`
