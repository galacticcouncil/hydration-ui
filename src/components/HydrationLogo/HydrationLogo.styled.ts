import styled from "@emotion/styled"
import { theme } from "theme"
import { m as motion } from "framer-motion"

export const SContainer = styled.div`
  position: relative;
`

export const SLogoBadgeContainer = styled.div`
  display: inline-flex;
  position: absolute;
  top: 100%;
  right: 0;
  padding-bottom: 2px;
  margin-top: -7px;

  pointer-events: none;
  overflow: hidden;
`

export const SLogoBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  padding: 2px 4px;

  font-size: 6px;
  line-height: 6px;
  font-weight: 800;
  font-family: "GeistSemiBold";

  color: ${theme.colors.black};

  background: linear-gradient(
    90deg,
    ${theme.colors.pink600} 0%,
    ${theme.colors.brightBlue600} 100%
  );
`
