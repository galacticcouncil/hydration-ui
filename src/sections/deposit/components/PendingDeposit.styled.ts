import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;

  background: ${theme.colors.darkBlue700};
  border-radius: ${theme.borderRadius.medium}px;

  color: ${theme.colors.white};

  padding: 20px;

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  align-items: center;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    pointer-events: none;

    border-radius: 8px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.27) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
      rgba(158, 167, 180, 0.2) 100%
    );

    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  @media ${theme.viewport.gte.sm} {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr auto;
  }
`
