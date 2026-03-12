import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { getToken } from "@galacticcouncil/ui/utils"

export const SPositionsCard = styled.div(
  ({ theme }) => css`
    background: ${getToken("container.primary.background")};
    border: 1px solid ${getToken("container.primary.border")};
    border-radius: ${theme.containers.cornerRadius.containersPrimary};
    padding: ${theme.space.l};
  `,
)

export const SPositionsStats = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.l};
    padding-block: ${theme.space.l};

    @media (min-width: 768px) {
      flex-direction: row;
      gap: ${theme.space.xxl};
    }
  `,
)

export const SStat = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xs};
  `,
)

export const STable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

export const STh = styled.th(
  ({ theme }) => css`
    text-align: left;
    padding: ${theme.space.s} ${theme.space.base};
    color: ${getToken("text.low")};
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;

    &:last-child {
      text-align: right;
    }
  `,
)

export const STd = styled.td(
  ({ theme }) => css`
    padding: ${theme.space.s} ${theme.space.base};
    color: ${getToken("text.high")};
    font-size: 14px;
    vertical-align: middle;

    &:last-child {
      text-align: right;
    }
  `,
)

export const STr = styled.tr(
  () => css`
    border-top: 1px solid ${getToken("container.primary.border")};

    &:hover {
      background: ${getToken("container.secondary.background")};
    }
  `,
)

export const SSubTr = styled.tr(
  ({ theme }) => css`
    border-top: 1px solid ${getToken("container.primary.border")};
    background: ${getToken("container.secondary.background")};

    &:hover {
      opacity: 0.85;
    }

    td {
      padding-left: ${theme.space.xl};
    }
  `,
)

export const SAssetCell = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.s};
  `,
)

export const SAssetIcon = styled.div(
  ({ theme }) => css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${getToken("container.secondary.background")};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  `,
)

export const SBadge = styled.div<{ color?: "purple" | "blue" }>(
  ({ theme, color = "purple" }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    background: ${color === "purple" ? "rgba(139, 92, 246, 0.15)" : "rgba(59, 130, 246, 0.15)"};
    color: ${color === "purple" ? "#a78bfa" : "#60a5fa"};
  `,
)
