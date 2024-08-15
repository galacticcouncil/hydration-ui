import styled from "@emotion/styled"

export const SBottlecapSPinner = styled.img`
  display: flex;
  margin: 0 auto;

  width: 160px;
  height: 160px;

  animation: spin 4s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
