import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background: linear-gradient(
    90.07deg,
    rgba(0, 86, 158, 0.2) 3.96%,
    rgba(206, 102, 255, 0.11) 97.23%
  );

  padding: 16px;

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

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media ${theme.viewport.gte.sm} {
    flex-direction: row;

    padding: 34px 30px;
  }
`
