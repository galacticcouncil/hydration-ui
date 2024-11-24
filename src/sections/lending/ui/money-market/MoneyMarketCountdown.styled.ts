import styled from "@emotion/styled"
import { theme } from "theme"

export const SContent = styled.div`
  --border-color: rgba(152, 176, 214, 0.27);

  position: relative;

  padding: 20px;
  color: white;

  background: ${theme.colors.darkBlue700};

  border: 1px solid var(--border-color);
  border-radius: ${theme.borderRadius.medium}px;

  text-align: center;
`
