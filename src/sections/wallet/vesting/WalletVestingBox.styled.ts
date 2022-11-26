import styled from "@emotion/styled"
import { theme } from "theme"

export const SBox = styled.div`
  background: ${theme.colors.darkBlue700};

  padding: 22px 20px;
  margin: -16px -12px;

  border-radius: 4px;

  position: relative;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(144, 165, 198, 0.3) 0%,
      rgba(144, 165, 198, 0.3) 50%,
      rgba(158, 167, 180, 0) 100%
    );

    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media ${theme.viewport.gte.sm} {
    box-shadow: 0px 10px 30px rgba(91, 144, 172, 0.12),
      3px 3px 0px rgba(126, 161, 194, 0.12);
    margin: 0;
  }
`
