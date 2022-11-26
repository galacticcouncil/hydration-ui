import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "../../../theme"

export const SSchedule = styled.div`
  background: linear-gradient(
    180deg,
    rgba(0, 86, 158, 0.2) 0%,
    rgba(206, 102, 255, 0.11) 100%
  );

  margin-top: 26px;
  position: relative;

  @media ${theme.viewport.gte.sm} {
    background: linear-gradient(
      180deg,
      rgba(0, 86, 158, 0.2) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
  }

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;

    padding: 1px;

    background: linear-gradient(
      180deg,
      rgba(144, 165, 198, 0.3) 0%,
      rgba(144, 165, 198, 0.3) 50%,
      rgba(158, 167, 180, 0) 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
`

export const SInner = styled.div`
  padding: 32px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;
    padding: 46px 74px;
    align-items: center;
  }
`

export const SClaimButton = styled(Button)`
  width: 100%;

  font-weight: 800;

  background: linear-gradient(
    360deg,
    #ff1e79 -32.73%,
    rgba(255, 103, 164, 0.32) 91.44%
  );

  box-shadow: 0px 10px 40px rgba(255, 103, 164, 0.31);

  border: 1px solid ${theme.colors.pink700};

  &:disabled {
    cursor: not-allowed;
    box-shadow: unset;
    border: 1px solid ${theme.colors.darkBlue200};

    color: ${theme.colors.darkBlue200};
    background: rgba(255, 255, 255, 0.2);

    &::after {
      all: unset;
    }
    @media ${theme.viewport.gte.sm} {
      border: unset;
    }
  }

  @media ${theme.viewport.gte.sm} {
    border: unset;

    box-shadow: unset;

    width: auto;

    background: ${theme.gradients.pinkLightPink};
  }
`
