import styled from "@emotion/styled"

export const SChartStateContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const SLoadingEl = styled.div`
  @keyframes grow {
    0% {
      transform: scale(0.5);
    }
    25% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.5);
    }
    100% {
      transform: scale(0.5);
    }
  }

  display: inline-block;
  background-color: white;
  border-radius: 4px;

  width: 15px;
  height: 15px;

  &:nth-of-type(1) {
    animation: 1.6s cubic-bezier(0.32, 0.06, 0.85, 1.11) 0s infinite normal none
      running grow;
  }

  &:nth-of-type(2) {
    animation: 1.6s cubic-bezier(0.32, 0.06, 0.85, 1.11) 200ms infinite normal
      none running grow;
  }

  &:nth-of-type(3) {
    animation: 1.6s cubic-bezier(0.32, 0.06, 0.85, 1.11) 400ms infinite normal
      none running grow;
  }
`
