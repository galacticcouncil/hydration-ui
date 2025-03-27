import styled from "@emotion/styled"
import { theme } from "theme"

export const SGigadotAnswers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding-block: 20px;

  background: ${theme.colors.darkBlue700};
  border-radius: 8px;

  border: 1px solid;
  border-image-source: linear-gradient(
    180deg,
    rgba(152, 176, 214, 0.27) 0%,
    rgba(163, 177, 199, 0.15) 66.67%,
    rgba(158, 167, 180, 0.2) 100%
  );
`
