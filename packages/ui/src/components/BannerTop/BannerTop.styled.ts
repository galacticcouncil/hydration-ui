import styled from "@emotion/styled"

export const SClose = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.space.s};
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`
