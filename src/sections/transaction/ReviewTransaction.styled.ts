import styled from "@emotion/styled"
import { theme } from "theme"

export const SDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${theme.colors.darkBlue401};

  &:last-child {
    border: none;
  }
`
