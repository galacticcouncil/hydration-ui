import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

import { ProviderLogo } from "@/components/provider/ProviderLogo"

export const SProviderBadge = styled(ProviderLogo)(
  ({ theme }) => css`
    position: absolute;
    right: ${pxToRem(-2)};
    bottom: ${pxToRem(-2)};

    border: 2px solid ${theme.buttons.outlineDark.rest};
    border-radius: ${theme.radii.full};
    background: ${theme.surfaces.themeBasePalette.background};
  `,
)
