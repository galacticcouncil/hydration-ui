import styled from "@emotion/styled"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 10px;
  margin-right: -14px;
  padding-bottom: 10px;
  padding-right: 12px;

  overflow-x: hidden;
  overflow-y: auto;
  max-height: 300px;

  &::-webkit-scrollbar-track {
    margin-bottom: 10px;
  }
`
