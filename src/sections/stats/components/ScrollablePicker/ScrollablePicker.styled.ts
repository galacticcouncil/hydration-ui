import styled from "@emotion/styled"

export const Container = styled.div<{ height: number }>`
  position: relative;

  overflow: hidden;
  overflow-y: auto;

  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;

  width: fit-content;
  height: ${(p) => p.height}px;

  ::-webkit-scrollbar {
    display: none;
  }

  mask-image: linear-gradient(
    transparent 0%,
    black 50%,
    black 50%,
    transparent 100%
  );
`

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`

export const SOption = styled.span<{ isActive: boolean }>`
  --padding: 14px;
  scroll-snap-align: center;

  text-align: center;
  padding: var(--padding);
`
