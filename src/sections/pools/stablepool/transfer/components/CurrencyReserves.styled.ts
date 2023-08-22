import styled from "@emotion/styled"
import { theme } from "theme"
export const SRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 15px 0;
  gap: 10px;
  border-bottom: 1px solid ${theme.colors.darkBlue400};
`
