import { pxToRem, styled } from "@/utils"

export const SMorphLabel = styled.span`
  display: inline-block;
  position: relative;
  overflow: hidden;
  height: ${pxToRem(15)};
  vertical-align: bottom;
  transition: width 0.35s cubic-bezier(0.19, 1, 0.22, 1);

  & > span {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    white-space: nowrap;
    transition: transform 0.35s cubic-bezier(0.19, 1, 0.22, 1);
  }

  & > span.enter-from-below {
    transform: translateY(100%);
    transition: none;
  }

  & > span.exit-up {
    transform: translateY(-100%);
  }
`
