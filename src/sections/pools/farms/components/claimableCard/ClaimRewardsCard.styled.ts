import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background: linear-gradient(
      0deg,
      rgba(255, 97, 144, 0.22) -0.13%,
      rgba(73, 105, 132, 0.02) 101.13%,
      rgba(132, 73, 91, 0.02) 101.13%
    ),
    rgba(67, 22, 43, 0.7);

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
      rgba(214, 152, 185, 0.41) 0%,
      rgba(199, 163, 176, 0.15) 66.67%,
      rgba(91, 151, 245, 0) 99.99%,
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
