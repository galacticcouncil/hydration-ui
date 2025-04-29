import styled from "@emotion/styled"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 100vh;
  width: 100vw;

  position: fixed;
  inset: 0;

  z-index: 1000;

  & > svg {
    width: 240px;
    height: auto;
  }
`
