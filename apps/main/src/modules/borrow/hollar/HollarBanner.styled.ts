import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    display: flex;
    height: 89px;

    border: 1px solid ${theme.details.separators};
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;

    &:before {
      content: "";
      position: absolute;
      inset: -1px;
      overflow: hidden;
      border-radius: ${theme.containers.cornerRadius.containersPrimary}px;

      background: linear-gradient(
        90deg,
        #c3e19f 52.49%,
        rgba(179, 207, 146, 0) 98.87%
      );

      ${mq("md")} {
        background: linear-gradient(
          90deg,
          #c3e19f 24.74%,
          rgba(179, 207, 146, 0) 62.63%
        );
      }
    }
  `,
)

export const SContent = styled.div(
  ({ theme }) => css`
    position: relative;
    width: 100%;
    height: 89px;

    padding-block: 18px;
    padding-left: 21px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.scales.paddings.s}px;

    ${mq("md")} {
      gap: 8px;
    }
  `,
)

export const SValuesContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.scales.paddings.xxl}px;
    padding-right: 30px;
  `,
)

export const SText = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.scales.paddings.s}px;

    ${mq("md")} {
      gap: 6px;
    }
  `,
)
