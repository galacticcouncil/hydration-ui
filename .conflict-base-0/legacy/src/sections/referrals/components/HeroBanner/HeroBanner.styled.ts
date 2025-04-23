import styled from "@emotion/styled"
import { theme } from "theme"

import referralsHeaderImage from "assets/images/referrals-header.webp"
import referralsHeaderImage2x from "assets/images/referrals-header@2x.webp"
import referralsHeaderImageMobile from "assets/images/referrals-header-mobile.webp"

export const SContainer = styled.div`
  position: relative;

  padding: 110px 20px 20px;

  min-height: 450px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  background-size: 100%;
  background-position: top;
  background-repeat: no-repeat;
  background-image: url(${referralsHeaderImageMobile});
  background-color: #07091d;

  margin: -20px -12px 0;

  @media ${theme.viewport.gte.sm} {
    padding: 30px 40px;
    margin: 0;

    background-position: top left;
    background-image: url(${referralsHeaderImage});

    @media only screen and (min-device-pixel-ratio: 2),
      only screen and (min-resolution: 2dppx) {
      background-image: url(${referralsHeaderImage2x});
    }

    ${theme.gradientBorder};
    border-radius: ${theme.borderRadius.medium}px;
    &::before {
      border-radius: ${theme.borderRadius.medium}px;
    }
  }

  @media ${theme.viewport.gte.md} {
    padding: 60px 80px;
    background-position: top center;
  }
`
