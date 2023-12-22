import styled from "@emotion/styled"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { theme } from "theme"

export const SContainer = styled.div`
  flex: column;
  justify: space-between;

  padding: 20px;

  background-color: ${theme.colors.darkBlue700};
  margin: 0 auto;

  @media ${theme.viewport.gte.sm} {
    padding: 30px;
    max-width: 570px;

    ${theme.gradientBorder};
    border-radius: ${theme.borderRadius.stakingCard}px;
    :before {
      border-radius: ${theme.borderRadius.stakingCard}px;
    }
  }
`

export const STitle = styled(GradientText)`
  font-size: 17px;
  font-weight: 500;
  font-family: "FontOver", sans-serif;

  background: ${theme.gradients.pinkLightBlue};
  background-clip: text;

  display: inline-block;

  @media ${theme.viewport.gte.sm} {
    font-size: 19px;
  }
`
