import styled from "@emotion/styled"

import gigaCampaignImg from "assets/images/giga-campaign.webp"
import gigaCampaignMobImg from "assets/images/giga-campaign-mob.webp"
import { theme } from "theme"

export const GigaBannerContainer = styled.div`
  display: flex;
  align-items: center;

  border-radius: 8px;

  background-image: url(${gigaCampaignMobImg});
  background-repeat: no-repeat;
  background-size: cover;

  padding-left: 70px;
  padding-right: 50px;

  width: 100%;
  height: 89px;

  @media ${theme.viewport.gte.sm} {
    padding-left: 100px;

    background-image: url(${gigaCampaignImg});
  }
`
