import styled from "@emotion/styled"
import { theme } from "theme"

export const SConvertionContainer = styled.div`
  background: ${theme.colors.darkBlue700};
  border: 1px solid ${theme.colors.darkBlue400};
  border-radius: 2px;

  position: absolute;
  top: 50%;
  right: 0;
  margin-right: var(--modal-content-padding);
  transform: translateY(-50%);

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
