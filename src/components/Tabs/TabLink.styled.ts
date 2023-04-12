import styled from "@emotion/styled"
import { Button } from "components/Button/Button"

export const SButton = styled(Button)<{ fullWidth?: boolean }>`
  padding: 12px 34px;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  white-space: nowrap;
`
