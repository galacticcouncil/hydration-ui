import styled from "styled-components/macro";
import { theme } from "theme";

export const CardWrapper = styled.button`
  border: none;
  border-radius: 20px;
  background: ${theme.gradients.cardGradient};
  display: flex;
  width: 100%;
  cursor: pointer;
  padding: 22px 26px 0;
  height: auto;
`;
