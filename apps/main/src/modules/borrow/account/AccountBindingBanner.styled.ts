import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"
import { hexToRgba } from "@galacticcouncil/utils"

export const SBanner = styled(Flex)(
  ({ theme }) => css`
    gap: 10px;
    flex-direction: column;

    overflow: hidden;

    padding: 18px;
    position: relative;

    border: 1px solid ${theme.details.tooltips};
    border-radius: ${theme.radii.xl}px;

    ${mq("md")} {
      padding-block: 18px;
      padding-inline: 30px;
    }
  `,
)

export const SBannerImageContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;

    z-index: -1;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        91.42% 82.21% at 93.32% 85.93%,
        ${hexToRgba(theme.surfaces.themeBasePalette.background, 0)},
        ${theme.surfaces.themeBasePalette.background} 81.85%
      );
    }

    ${mq("md")} {
      &::after {
        background: linear-gradient(
            270deg,
            ${hexToRgba(theme.surfaces.themeBasePalette.background, 0)} 25%,
            ${theme.surfaces.themeBasePalette.background} 55%
          ),
          no-repeat;
      }
    }
  `,
)

export const SBannerImage = styled.img`
  object-fit: cover;
  object-position: 70%;
  opacity: 0.6;

  ${mq("md")} {
    object-position: top right;
  }
`
