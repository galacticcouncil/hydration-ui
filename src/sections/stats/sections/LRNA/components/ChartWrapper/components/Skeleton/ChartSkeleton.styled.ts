import styled from "@emotion/styled"

export const SkeletonClipPath = styled.div`
  --base-color: rgba(255, 255, 255, 0.12);
  --bg: linear-gradient(
      269.83deg,
      rgba(79, 223, 255, 0) 104.57%,
      rgba(79, 223, 255, 0.17) 119.06%,
      rgba(79, 234, 255, 0) 132.96%
    ),
    radial-gradient(
      70.61% 87.24% at 49.84% 3.18%,
      rgba(79, 223, 255, 0.31) 0%,
      rgba(79, 234, 255, 0) 100%
    );
  --highlight-color: rgba(255, 255, 255, 0.24);
  --animation-duration: 1.5s;
  --animation-direction: normal;
  --pseudo-element-display: block;

  background: var(--bg);

  -webkit-clip-path: url(#clip-path);
  clip-path: url(#clip-path);

  width: 100%;

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
