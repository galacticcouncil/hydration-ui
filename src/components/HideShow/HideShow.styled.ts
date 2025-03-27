import styled from "@emotion/styled"
import { theme } from "theme"

export const SHideShow = styled.div<{ readonly isOpen: boolean }>`
  display: flex;
  align-items: center;
  color: ${theme.colors.darkBlue300};

  cursor: pointer;

  svg {
    rotate: ${({ isOpen }) => (!isOpen ? "0deg" : "180deg")};
    transition: all 0.15s ease-in-out;
  }
`
