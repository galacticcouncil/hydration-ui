import { css } from "@emotion/react"
import { styled } from "@galacticcouncil/ui/utils"

export const SInvalidAssetHeader = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.quart};

    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
)
