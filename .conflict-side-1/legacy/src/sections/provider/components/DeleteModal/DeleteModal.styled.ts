import styled from "@emotion/styled"

export const SModalOverlay = styled.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  width: 100%;

  position: absolute;
  top: 1px;
  left: 1px;

  background: rgba(17, 19, 32, 0.9);

  border-radius: 4px;
`

export const SModalContainer = styled.div`
  height: calc(100% - 1px);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
`
