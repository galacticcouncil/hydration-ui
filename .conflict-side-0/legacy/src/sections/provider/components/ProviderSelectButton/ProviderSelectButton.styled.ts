import styled from "@emotion/styled"
import { m as motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;
  width: min-content;

  margin-left: auto;
  margin-right: 12px;
  margin-bottom: 16px;

  padding-bottom: calc(80px + env(safe-area-inset-bottom));

  @media ${theme.viewport.gte.sm} {
    margin-left: auto;
    margin-right: 20px;
    right: 0px;
    bottom: 16px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }

  @media ${theme.viewport.gte.md} {
    position: fixed;
    bottom: 16px;
    right: 20px;
    margin: 0;
    padding-bottom: 0;
  }
`

export const SButton = styled(motion.div)`
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
`

export const SName = styled(motion.div)`
  display: flex;
  align-items: center;

  width: 0;
  overflow: hidden;

  color: ${theme.colors.white};
`
