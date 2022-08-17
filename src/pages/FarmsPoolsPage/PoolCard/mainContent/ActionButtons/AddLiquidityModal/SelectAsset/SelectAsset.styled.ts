import { margins } from "common/styles"
import { Button } from "components/Button/Button"
import styled from "styled-components/macro"
import { theme } from "theme"

export const AssetWrapper = styled.div`
  border-radius: 12px;
  background: rgba(${theme.rgbColors.primary100}, 0.06);
  padding: 20px;
  ${margins};
`

export const MaxButton = styled(Button)`
  background: rgba(${theme.rgbColors.white}, 0.06);
  color: ${theme.colors.white};
  font-weight: 600;

  :hover {
    background: rgba(${theme.rgbColors.white}, 0.15);
  }
`

export const SelectAssetButton = styled(Button)`
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 10px;
  text-transform: none;
  padding: 5px;

  :hover {
    background: rgba(${theme.rgbColors.white}, 0.15);
  }
`
