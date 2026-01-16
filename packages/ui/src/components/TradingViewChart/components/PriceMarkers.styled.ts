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

export const SPriceMarkerTag = styled.div(
  ({ theme }) => css`
    position: absolute;
    right: 0;
    transform: translateY(-50%);

    padding: 4px 8px;
    border-radius: 4px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;

    background-color: transparent;
    color: ${theme.text.high};
    transition: all 0.2s ease;

    cursor: pointer;
    z-index: 2;

    :hover {
      background-color: ${theme.text.high};
      color: ${theme.text.contrast};
    }
  `,
)
