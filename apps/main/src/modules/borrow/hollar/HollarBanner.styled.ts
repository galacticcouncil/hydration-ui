import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"
export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  position: relative;
`

export const SInnerContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 6px;

    overflow: hidden;

    position: relative;

    border: 1px solid ${theme.details.separators};
    border-radius: ${theme.radii.xl}px;

    ${mq("md")} {
      height: 89px;
    }

    &:before {
      content: "";
      position: absolute;
      inset: -1px;
      overflow: hidden;
      border-radius: ${theme.radii.xl}px;

      background: linear-gradient(
        180deg,
        #b3cf92 0%,
        rgba(179, 207, 146, 0.75) 100%
      );

      ${mq("md")} {
        background: linear-gradient(
          90deg,
          #b3cf92 0%,
          #c3e19f 25%,
          rgba(179, 207, 146, 0) 75%
        );
      }
    }
  `,
)

export const SContent = styled.div`
  position: relative;
  height: 100%;

  padding: 20px;

  display: flex;
  gap: 8px;

  flex-direction: column;

  ${mq("md")} {
    gap: 20px;

    padding-left: 140px;
    padding-right: 34px;

    flex-direction: row;
    align-items: center;
  }
`

export const SValuesContainer = styled.div`
  display: none;
  ${mq("md")} {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    margin-left: auto;
    margin-top: 0;
    align-items: center;
    gap: 60px;
  }
`
export const SHollarImage = styled.img`
  position: absolute;

  top: -14px;
  right: -8px;

  ${mq("md")} {
    left: 14px;

    right: auto;
  }
`
