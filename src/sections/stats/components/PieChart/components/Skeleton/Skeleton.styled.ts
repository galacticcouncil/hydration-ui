import { theme } from "theme"
import styled from "@emotion/styled"

export const SkeletonClipPath = styled.div`
  --base-color: rgba(255, 255, 255, 0.12);
  --highlight-color: rgba(255, 255, 255, 0.24);
  --animation-duration: 1.5s;
  --animation-direction: normal;
  --pseudo-element-display: block;

  background-color: var(--base-color);

  -webkit-clip-path: url(#clip-path);
  clip-path: url(#clip-path);

  width: 300px;

  height: 300px;

  position: absolute;
  inset: 0;

  overflow: hidden;
  z-index: 1; /* Necessary for overflow: hidden to work correctly in Safari */

  &:after {
    content: " ";
    display: var(--pseudo-element-display);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-repeat: no-repeat;
    background-image: linear-gradient(
      90deg,
      var(--base-color),
      var(--highlight-color),
      var(--base-color)
    );
    transform: translateX(-100%);

    animation-name: react-loading-skeleton;
    animation-direction: var(--animation-direction);
    animation-duration: var(--animation-duration);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
`

export const SSkeletonContainer = styled.div`
  align-self: center;

  margin: -60px;

  transform: scale(0.56);

  height: 300px;
  width: 300px;

  position: relative;

  @media (${theme.viewport.gte.sm}) {
    margin: 0;

    transform: scale(0.94);
  }
`
