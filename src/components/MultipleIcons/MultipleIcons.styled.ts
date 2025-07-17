import styled from "@emotion/styled"
import { ResponsiveValue, getResponsiveStyles } from "utils/responsive"

export const IconsWrapper = styled.div<{
  size: ResponsiveValue<number>
  maskConfig: Array<boolean>
}>`
  ${({ size }) =>
    getResponsiveStyles(size, (value) => ({
      "--logo-size": `${value}px`,
      "--logo-overlap": "4px",
      "--chain-size": `${value / 2}px`,
      "--chain-offset": `${value * 0.1}px`,
    }))};

  position: relative;
  flex-shrink: 0;
  position: relative;
  display: flex;

  & > span {
    width: var(--logo-size);
    height: var(--logo-size);
    > svg {
      width: var(--logo-size);
      height: var(--logo-size);
    }
  }

  > :not(:first-of-type) {
    margin-left: calc(var(--logo-overlap) * -1);
  }

  &[data-atokens]::before {
    content: "";
    position: absolute;
    background: linear-gradient(to right, #39a5ff, #0063b5 50%, transparent);
    padding: 2px;
    inset: -5px;
  }

  &[data-atokens="2"]::before {
    mask-image: radial-gradient(
        circle var(--logo-size) at calc(35% - calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(65% + calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      );
  }

  &[data-atokens="3"]::before {
    mask-image: radial-gradient(
        circle var(--logo-size) at calc(25% - calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(50%),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(75% + calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      );
  }

  &[data-atokens="4"]::before {
    mask-image: radial-gradient(
        circle var(--logo-size) at calc(20% - calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(40% - calc(var(--logo-size) * 0.045)),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(60% + calc(var(--logo-size) * 0.045)),
        black 0%,
        black 56%,
        transparent 58%
      ),
      radial-gradient(
        circle var(--logo-size) at calc(80% + calc(var(--logo-size) * 0.09)),
        black 0%,
        black 56%,
        transparent 58%
      );
  }
`
