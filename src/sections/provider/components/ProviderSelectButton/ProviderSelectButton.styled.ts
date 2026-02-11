import styled from "@emotion/styled"
import { Text } from "components/Typography/Text/Text"
import { m as motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 10px;

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

export const SPreview = styled(Text)`
  color: white;
  white-space: nowrap;

  display: flex;
  align-items: center;

  height: 100%;
  padding-inline: 8px;

  border-radius: 4px;
  border: 0.674px solid var(--primary-Alpha_0-35, rgba(47, 211, 247, 0.35));
  background: linear-gradient(
    180deg,
    rgba(0, 4, 29, 0.25) 0%,
    var(--primary-bright-blue-700-alpha, rgba(0, 159, 255, 0.63)) 98.17%
  );
  backdrop-filter: blur(20px);

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(47, 211, 247, 0.6);
    background: linear-gradient(
      180deg,
      rgba(0, 4, 29, 0.35) 0%,
      rgba(0, 159, 255, 0.8) 98.17%
    );
    box-shadow: 0 0 12px rgba(47, 211, 247, 0.25);
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
