import { css, styled } from "@galacticcouncil/ui/utils"

export const SBadge = styled.p(
  ({ theme }) => css`
    background: ${theme.text.tint.primary};

    border-radius: ${theme.containers.cornerRadius.buttonsPrimary}px;

    padding: 1px 5px;

    position: absolute;
    top: -4px;
    right: -4px;

    color: black;
  `,
)
