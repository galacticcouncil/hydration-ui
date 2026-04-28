import { Box, Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SChartContainer = styled(Box)(
  ({ theme }) => css`
    position: relative;
    overflow: hidden;
    background: ${theme.surfaces.containers.mid.primary};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};
    border: 1px solid ${theme.details.borders};
  `,
)

export const SChartLegendContainer = styled(Box)(
  ({ theme }) => css`
    padding: ${theme.containers.paddings.primary};

    background: ${theme.surfaces.containers.dim.dimOnBg};
  `,
)

// export const SGigaHDXBanner = styled(Box)(
//   ({ theme }) => css`
//     position: relative;

// background: linear-gradient(
//   90deg,
//   ${theme.colors.basePalette.coralPink} 5.78%,
//   rgba(229, 62, 118, 0) 75.2%
// );
//     border-radius: ${theme.containers.cornerRadius.containersPrimary};
//     border: 1px solid ${theme.colors.basePalette.coralPink};
//   `,
// )

export const SGigaHDXBanner = styled(Flex)(
  ({ theme }) => css`
    position: relative;

    height: 5.25rem;

    border: 1px solid ${theme.details.separators};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};

    &:before {
      content: "";
      position: absolute;
      inset: -1px;
      overflow: hidden;
      border-radius: ${theme.containers.cornerRadius.containersPrimary};

      background: linear-gradient(
        90deg,
        ${theme.colors.basePalette.coralPink} 5.78%,
        rgba(229, 62, 118, 0) 75.2%
      );

      ${mq("md")} {
        background: linear-gradient(
          90deg,
          ${theme.colors.basePalette.coralPink} 24.74%,
          rgba(179, 207, 146, 0) 62.63%
        );
      }
    }
  `,
)
