import { Icon } from "components/Icon/Icon"
import styled from "styled-components/macro"
import { theme } from "theme"

export const AssetIconWrapper = styled(Icon)`
  position: relative;
`

export const StyledIcon = styled(Icon)`
  width: 28px;
  height: 28px;
  background: ${theme.colors.black};
  border-radius: 50%;

  > svg {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 26px;
    height: 26px;
  }
`
export const StyledChainedIcon = styled(Icon)`
  position: absolute;
  left: 15px;
  top: 0;
  z-index: ${theme.zIndices.chainedIcon};
  background: ${theme.colors.black};
  border-radius: 50%;
  width: 15px;
  height: 15px;

  > svg {
    position: absolute;
    width: 13px;
    height: 13px;
    top: 1px;
    left: 1px;
  }
`
