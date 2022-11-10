import styled from "@emotion/styled"
import { Label } from "@radix-ui/react-label"
import { theme } from "theme"

export const SLabel = styled(Label)<{ error?: string }>`
  color: ${(p) => (p.error ? theme.colors.error : theme.colors.white)};
  text-transform: capitalize;
`

export const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
  text-transform: capitalize;
`

export const LabelWrapper = styled.div`
  font-size: 16px;
  line-height: 22px;
`
