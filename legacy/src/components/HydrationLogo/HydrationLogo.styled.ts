import styled from "@emotion/styled"
import { theme } from "theme"
import { m as motion } from "framer-motion"
import { css } from "@emotion/react"

export const SContainer = styled.div`
  position: relative;
  display: inline-flex;
  color: ${theme.colors.white};
`

export const SLogoBadgeContainer = styled.div`
  display: inline-flex;
  position: absolute;
  top: 100%;
  right: 0;
  padding-bottom: 2px;
  margin-top: -3px;

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
  text-transform: uppercase;

  color: ${theme.colors.black};

  background: linear-gradient(
    90deg,
    ${theme.colors.pink600} 0%,
    ${theme.colors.brightBlue600} 100%
  );
`

export const SMobileLogoMask = styled.div<{ cropped: boolean }>`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ cropped }) =>
    cropped &&
    css`
      -webkit-mask: radial-gradient(
        110% 120% at 80% 80%,
        transparent 25%,
        white 25%
      );
      mask: radial-gradient(110% 120% at 80% 80%, transparent 25%, white 25%);
    `}
`
