import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SButton = styled(motion.div)`
  position: relative;
  width: min-content;

  margin-left: auto;
  margin-right: 12px;
  margin-bottom: 16px;

  display: flex;
  align-items: center;

  padding: 4px 10px;

  border: 1px solid rgba(176, 219, 255, 0.2);
  border-radius: 4px;

  background: linear-gradient(
    180deg,
    rgba(0, 4, 29, 0.63) 0%,
    rgba(0, 4, 29, 0.252) 98.17%
  );
  backdrop-filter: blur(20px);

  cursor: pointer;

  @media ${theme.viewport.gte.md} {
    position: fixed;
    bottom: 16px;
    right: 20px;

    margin: 0;
  }

  @media ${theme.viewport.gte.sm} {
    margin-left: auto;
    margin-right: 20px;
    right: 0px;
    bottom: 16px;
  }
`

export const SName = styled(motion.div)`
  display: flex;
  align-items: center;

  width: 0;
  overflow: hidden;

  color: ${theme.colors.white};
`
