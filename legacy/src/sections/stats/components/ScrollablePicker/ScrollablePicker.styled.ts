import styled from "@emotion/styled"

export const Container = styled.div`
  position: relative;

  text-align: center;

  width: 100%;

  ::-webkit-scrollbar {
    display: none;
  }

  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 40%,
    black 60%,
    transparent 100%
  );
`

export const InnerContainer = styled.div`
  overflow: hidden;
  overflow-x: auto;

  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  padding: 0 50%;

  display: flex;
  flex-direction: row;
  align-items: start;
`

export const SOption = styled.span<{ isActive: boolean }>`
  --padding: 14px;
  scroll-snap-align: center;

  text-align: center;
  padding: var(--padding);

  white-space: nowrap;
`
