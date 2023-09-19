import styled from "@emotion/styled"
import { SContainer } from "sections/staking/StakingPage.styled"

export const SRewardCardContainer = styled(SContainer)`
  gap: 0;

  background: linear-gradient(
      0deg,
      rgba(255, 97, 144, 0.22) -0.13%,
      rgba(73, 105, 132, 0.02) 101.13%,
      rgba(132, 73, 91, 0.02) 101.13%
    ),
    rgba(67, 22, 43, 0.7);

  :before {
    background: linear-gradient(
      180deg,
      rgba(214, 152, 185, 0.41) 0%,
      rgba(199, 163, 176, 0.15) 66.67%,
      rgba(91, 151, 245, 0) 99.99%,
      rgba(158, 167, 180, 0) 100%
    );
  }
`

export const SRewartCardHeader = styled.div`
  padding: 20px 24px;

  display: flex;
  align-items: center;
  gap: 12px;

  border-bottom: 1px solid #55394e;
`
