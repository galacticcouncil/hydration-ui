import styled from "@emotion/styled"
import { theme } from "theme"

export const SCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;

  background-color: rgba(6, 9, 23, 0.4);
  border-radius: 4px;

  position: relative;

  padding: 16px 20px;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      127.93deg,
      rgba(152, 176, 214, 0.22) 5.11%,
      rgba(163, 177, 199, 0.15) 49.64%,
      rgba(91, 151, 245, 0) 71.89%,
      rgba(158, 167, 180, 0) 71.9%
    );

    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media (${theme.viewport.gte.sm}) {
    flex-direction: column;

    padding: 30px 40px;
  }
`
