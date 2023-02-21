import styled from "@emotion/styled"
import { ResponsiveValue, getResponsiveStyles } from "utils/responsive"

export const IconsWrapper = styled.div<{ size: ResponsiveValue<number> }>`
  --additional-space: 1px;
  ${({ size }) =>
    getResponsiveStyles(size, (value) => ({ "--avatar-size": `${value}px` }))};
  --mask-radius: calc(var(--avatar-size) / 2);
  --circle-size: calc(var(--avatar-size) * 0.75);

  position: relative;

  display: flex;

  & > span {
    width: var(--avatar-size);
    height: var(--avatar-size);
    > svg {
      width: var(--avatar-size);
      height: var(--avatar-size);
    }
  }

  > :not(:last-of-type) {
    mask: radial-gradient(
      circle at
        calc(var(--circle-size) + var(--mask-radius) + var(--additional-space)),
      transparent calc(var(--mask-radius) + var(--additional-space)),
      white 0
    );
  }

  > :not(:first-of-type) {
    margin-left: -4px;
  }
`
