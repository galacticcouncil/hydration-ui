import styled from "@emotion/styled"
import { theme } from "theme"
import QuestionmarkIcon from "assets/icons/QuestionmarkIcon.svg?react"

export const SHeader = styled.header`
  position: sticky;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.header};

  width: 100%;

  backdrop-filter: blur(27px);
  background: rgba(9, 9, 9, 0.11);

  padding: 8px;

  @media ${theme.viewport.gte.sm} {
    padding: 12px 40px;
  }

  @media ${theme.viewport.gte.lg} {
    padding: 8px 40px;
  }
`

export const SQuestionmark = styled(QuestionmarkIcon)`
  color: ${theme.colors.brightBlue100};

  top: 8px;

  padding: 9px;

  width: 35px;
  height: 35px;

  border-radius: 50%;

  transition: ${theme.transitions.slow};

  :hover {
    color: ${theme.colors.white};
    cursor: pointer;

    background: rgba(${theme.rgbColors.alpha0}, 0.06);
  }
`
