import styled from "@emotion/styled"

export const SClose = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.space.s};
  top: 50%;
  transform: translateY(-50%);
  width: ${({ theme }) => theme.sizes.l};
  height: ${({ theme }) => theme.sizes.l};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`
