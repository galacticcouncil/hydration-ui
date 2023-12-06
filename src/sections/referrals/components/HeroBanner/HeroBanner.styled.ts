import styled from "@emotion/styled"
import { theme } from "theme"

import referralsHeaderImage from "assets/images/referrals-header.webp"
import referralsHeaderImage2x from "assets/images/referrals-header@2x.webp"

export const SContainer = styled.div`
  position: relative;

  padding: 20px;

  background-size: contain;
  background-repeat: no-repeat;
  background-position: top left;
  background-image: url(${referralsHeaderImage});
  background-color: #07091d;

  @media only screen and (min-device-pixel-ratio: 2),
    only screen and (min-resolution: 2dppx) {
    background-image: url(${referralsHeaderImage2x});
  }

  ${theme.gradientBorder};
  border-radius: ${theme.borderRadius.stakingCard}px;
  &::before {
    border-radius: ${theme.borderRadius.stakingCard}px;
  }

  @media ${theme.viewport.gte.sm} {
    padding: 30px 40px;
  }

  @media ${theme.viewport.gte.md} {
    padding: 60px 80px;
    background-position: top center;
  }
`
