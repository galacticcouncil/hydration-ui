import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const popBounce = keyframes`
  0% { transform: scaleX(1); }
  60% { transform: scaleX(1.15); }
  80% { transform: scaleX(0.97); }
  100% { transform: scaleX(1); }
`

export const Pill = styled.div<{ disableAnimation?: boolean }>(
  ({ theme, disableAnimation }) => css`
    display: flex;
    align-items: center;

    overflow: hidden;
    border-radius: 9999px;
    background: ${theme.buttons.primary.high.rest};
    color: #fff;

    font-size: 12px;
    font-weight: 700;
    font-family: ${theme.fontFamilies1.primary};
    line-height: 1;

    cursor: pointer;
    width: 14px;
    height: 14px;
    transition: width 0.3s ease-out;

    white-space: nowrap;

    &:hover {
      width: 100%;
    }

    ${disableAnimation &&
    css`
      pointer-events: none;
    `}
  `,
)

export const Label = styled.span`
  display: inline-block;
  position: relative;
  transform-origin: left center;

  margin-left: 3px;
  padding-right: 4px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 8px;
    width: 58px;
    background: #e2437a;
    transition: opacity 0.3s ease-out;
    pointer-events: none;
  }

  ${Pill}:hover &::after {
    opacity: 0;
  }

  ${Pill}:hover & {
    animation: ${popBounce} 0.3s ease-out;
  }
`
