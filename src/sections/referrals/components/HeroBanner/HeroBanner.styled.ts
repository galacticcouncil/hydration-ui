import styled from "@emotion/styled"
import { theme } from "theme"

import referralsHeaderImage from "assets/images/referrals-header.png"

export const SContainer = styled.div`
  position: relative;

  padding: 20px;

  background-image: url(${referralsHeaderImage});
  background-size: cover;
  background-position: top left;

  ${theme.gradientBorder};
  border-radius: ${theme.borderRadius.stakingCard}px;
  &::before {
    border-radius: ${theme.borderRadius.stakingCard}px;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: ${theme.colors.black};
    z-index: -1;
  }

  @media ${theme.viewport.gte.sm} {
    padding: 30px 40px;
  }

  @media ${theme.viewport.gte.md} {
    padding: 60px 80px;
    background-position: top center;
  }
`
