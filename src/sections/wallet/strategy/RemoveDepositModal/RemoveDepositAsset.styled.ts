import styled from "@emotion/styled"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 12px;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.06);
  border-radius: 4px;

  @media ${theme.viewport.gte.sm} {
    padding: 16px;
  }
`
export const SAssetContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const SAssetLabel = styled(Text)`
  border-bottom: 1px solid rgba(${theme.rgbColors.darkBlue400}, 0.3);
  padding-bottom: 10px;
`
