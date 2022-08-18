import styled, { keyframes } from "styled-components/macro"

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-360deg);
  }
`

export const Spinner = styled.span`
  --spinner-width: 3px;

  display: block;
  position: relative;

  width: 20px;
  height: 20px;

  border-radius: 9999px;
  mask: radial-gradient(
    farthest-side,
    rgba(255, 255, 255, 0) calc(100% - var(--spinner-width)),
    rgba(255, 255, 255, 1) calc(100% - var(--spinner-width) + 1px)
  );

  animation: ${spin} 0.6s linear infinite;

  overflow: hidden;

  background: conic-gradient(
    from 0deg,
    hsla(149, 83%, 63%, 1) 0deg,
    hsla(149, 83%, 63%, 1) 45deg,
    hsla(37, 97%, 59%, 1) 140deg,
    hsla(40, 91%, 67%, 1) 160deg,
    hsla(240, 6%, 44%, 0) 220deg,
    hsla(29, 100%, 72%, 0)
  );

  &:before {
    content: "";
    position: absolute;

    width: var(--spinner-width);
    height: var(--spinner-width);
    background: hsla(149, 83%, 63%, 1);

    border-radius: 9999px;
    top: 0;
    left: 50%;

    transform: translateX(calc(var(--spinner-width) / -2));
  }
`
