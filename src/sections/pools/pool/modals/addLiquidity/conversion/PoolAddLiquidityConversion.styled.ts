import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  border-radius: 7px;
  background: ${theme.colors.backgroundGray800};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  width: max-content;

  p {
    font-size: 11px;
    line-height: 15px;
  }
`
