import { Box } from "components/Box/Box";
import styled from "styled-components/macro";
import { theme } from "theme";

export const FooterWrapper = styled(Box)`
  background: rgba(${theme.rgbColors.primarySuccess450}, 0.12);
  padding: 15px 102px 15px 25px;
  border-radius: 0 0 20px 20px;
`;
