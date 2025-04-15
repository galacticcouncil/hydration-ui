import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { DATA_TABLE_SPACING, DATA_TABLE_SIZE } from "components/DataTable"
import {
  supplyAssetsTableSize,
  supplyAssetsTableSpacing,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.constants"
import { theme } from "theme"

export const getSupplyGigadotRowGradient = (rotation: number) => css`
  background: linear-gradient(
    ${rotation}deg,
    rgba(12, 88, 138, 0.4) 0.04%,
    rgba(12, 88, 138, 0) 56.6%
  );
`

export const SSupplyGigadotDesktopRow = styled.tr`
  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.06);
  }

  ${getSupplyGigadotRowGradient(90)}
  ${DATA_TABLE_SPACING[supplyAssetsTableSpacing]}
  ${DATA_TABLE_SIZE[supplyAssetsTableSize]}
`
