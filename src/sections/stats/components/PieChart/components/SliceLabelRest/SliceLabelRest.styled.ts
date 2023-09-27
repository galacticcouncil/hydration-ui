import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SSliceLabelContainer = styled(motion.div)`
  --x-padding: 30px;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);
  border-radius: 8px;

  box-shadow: 0px 28px 82px rgba(${theme.rgbColors.black}, 0.74);

  backdrop-filter: blur(40px);

  padding: 20px;

  width: 100%;

  :before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: 4px;
    padding: 1px; // a width of the border

    background: linear-gradient(
      180deg,
      rgba(152, 176, 214, 0.22) 0%,
      rgba(163, 177, 199, 0.15) 66.67%,
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

  @media (${theme.viewport.gte.sm}) {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;

    width: 400px;
  }
`

export const SRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 50px minmax(50px, auto);
  grid-column-gap: 12px;
`
