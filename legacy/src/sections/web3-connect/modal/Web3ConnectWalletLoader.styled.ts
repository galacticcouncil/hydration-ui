import styled from "@emotion/styled"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const SContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  align-items: center;
  justify-items: center;

  > * {
    grid-column: 1;
    grid-row: 1;
  }
`
