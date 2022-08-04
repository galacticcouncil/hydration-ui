import styled from "styled-components/macro";
import { theme } from "theme";

export const StyledPage = styled.div`
  background: ${theme.gradients.verticalGradient};
  height: 100vh;
  overflow-y: auto;
`;
export const PageInner = styled.div`
  padding: 44px 0;
  max-width: 1109px;
  margin: 0 auto;
`;
