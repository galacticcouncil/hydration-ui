import styled from "@emotion/styled"
import { Box } from "components/Box/Box.styled"
import { theme } from "theme"

export const SVotingBox = styled(Box)`
  padding: 18px 28px;

  border-radius: ${theme.borderRadius.stakingCard}px;

  :before {
    border-radius: ${theme.borderRadius.stakingCard}px;
  }
`

export const SDetailsBox = styled(Box)`
  padding: 18px 28px 38px;

  box-shadow: none;

  border-radius: ${theme.borderRadius.stakingCard}px;

  :before {
    border-radius: ${theme.borderRadius.stakingCard}px;

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    );
  }
`

export const SBage = styled.div`
  padding: 3px 8px;

  background: ${theme.colors.pink600};
  color: ${theme.colors.basic900};

  border-radius: 2px;
`
