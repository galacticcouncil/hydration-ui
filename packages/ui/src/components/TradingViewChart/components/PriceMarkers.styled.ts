import { css, styled } from "@/utils"

export const SPriceMarkerLine = styled.div(
  ({ theme }) => css`
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    border-top: 1px dashed ${theme.text.high};
    pointer-events: none;
    z-index: 1;
  `,
)

export const SPriceMarkerAnchor = styled.div(
  () => css`
    position: absolute;
    left: 0;
    transform: translateY(-50%);
    z-index: 2;
  `,
)

export const SPriceMarkerTag = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    background-color: ${theme.details.values.positive};
    color: ${theme.text.contrast};
    cursor: pointer;

    span + span {
      padding-left: 6px;
      border-left: 1px solid ${theme.text.contrast}40;
    }

    :hover {
      opacity: 0.85;
    }
  `,
)
