import styled from "@emotion/styled"
import { ResponsiveValue, getResponsiveStyles } from "utils/responsive"

export const IconsWrapper = styled.div<{
  size: ResponsiveValue<number>
  maskConfig: Array<boolean>
}>`
  ${({ size }) =>
    getResponsiveStyles(size, (value) => ({
      "--logo-size": `${value}px`,
      "--logo-overlap": `${value * 0.3}px`,
      "--chain-size": `${value / 2}px`,
      "--chain-offset": `${value * 0.1}px`,
    }))};

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

  padding: var(--chain-offset) var(--chain-offset) 0 0;
  margin-top: calc(var(--chain-offset) * -1);
  margin-right: calc(var(--chain-offset) * -1);

  --mask-space: 1px;
  --mask-gradient: calc(var(--chain-size) / 2),
    black calc(var(--chain-size) / 2 - 1px),
    transparent calc(var(--chain-size) / 2 - 1px),
    transparent calc(var(--chain-size) / 2 + var(--mask-space)),
    black calc(var(--chain-size) / 2 + var(--mask-space) + 0.5px);

  --mask-offset: calc(
    var(--logo-size) - var(--chain-size) / 2 + var(--chain-offset)
  );

  mask: ${({ maskConfig }) => maskConfig.map(mapToMask).join(",")},
    linear-gradient(black, black);

  -webkit-mask-composite: destination-in;
  mask-composite: exclude;
`

function mapToMask(hasMask: boolean, index: number) {
  const shape = hasMask ? "circle" : "0 0"
  return `radial-gradient(${shape} at calc(var(--logo-size) * ${index} - var(--logo-overlap) * ${index} + var(--mask-offset)) var(--mask-gradient))`
}
