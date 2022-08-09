import styled from "styled-components/macro";
import { theme } from "theme";

export const CardWrapper = styled.div`
  border: none;
  border-radius: 20px;
  background: ${theme.gradients.cardGradient};
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  overflow: hidden;
`;
