import { css, styled } from "@/utils"

export const SAddressField = styled.div(
  ({ theme }) => css`
    padding-block: ${theme.containers.paddings.primary}px;

    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.m}px;
  `,
)
