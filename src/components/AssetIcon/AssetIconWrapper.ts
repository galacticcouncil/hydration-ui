import { Icon } from "components/Icon/Icon";
import styled from "styled-components/macro";
import { theme } from "theme";

export const AssetIconWrapper = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  > svg {
    width: 30px;
    height: 30px;
  }
`;
export const StyledIcon = styled(Icon)`
  width: 30px;
  height: 30px;
  > svg {
    width: 30px;
    height: 30px;
  }
`;
export const StyledChainedIcon = styled(Icon)`
  position: absolute;
  left: 20px;
  top: 0;
  width: 13px;
  height: 13px;

  > svg {
    width: 13px;
    height: 13px;
  }
`;
