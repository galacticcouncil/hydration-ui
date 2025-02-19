import styled from "@emotion/styled"
import { theme } from "theme"

export const SBadge = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 15px;
  height: 15px;

  border-radius: 50%;
  font-size: 11px;
  line-height: 1;

  position: absolute;
  top: -7px;
  right: -7px;

  background: ${theme.colors.pink700};
`
