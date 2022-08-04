import styled from "styled-components";
import { theme } from "theme";

export const CardWrapper = styled.button`
  border: none;
  border-radius: 20px;
  background: ${theme.gradients.cardGradient};
  height: 300px;
  display: flex;
  width: 100%;
  cursor: pointer;
  padding: 22px 30px 0;
`;
