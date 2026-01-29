import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"

export const SContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    display: flex;
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
    height: 5.25rem;

    padding-block: ${theme.space.l};
    padding-left: ${theme.space.xl};

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.s};

    ${mq("md")} {
      gap: ${theme.space.base};
    }
  `,
)

export const SValuesContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.xxl};
    padding-right: ${theme.space.xxl};
  `,
)

export const SText = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};

    ${mq("md")} {
      gap: ${theme.space.base};
    }
  `,
)
