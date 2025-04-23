import { css, styled } from "@galacticcouncil/ui/utils"

export const SSettingsContentDesktop = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 4px;

    padding: ${theme.containers.paddings.quart}px
      ${theme.containers.paddings.tertiary}px;
  `,
)

export const SSettingsContentMobile = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.s}px;

    padding: ${theme.buttons.paddings.tertiary}px
      ${theme.containers.paddings.quart}px;
  `,
)

export const SSettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
