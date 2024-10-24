import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const assetPlaceholderCss = css`
  --uigc-bsx-icon-display: none;
  --uigc-hdx-icon-display: flex;
`

export const SATokenWrapper = styled.div`
  --width: 2px;

  position: relative;
  z-index: 0;

  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: -5px;
    background: var(
      --c,
      linear-gradient(to right, #39a5ff, #0063b5 50%, transparent)
    );
    padding: var(--width);
    border-radius: 50%;
    mask:
      linear-gradient(#000 0 0) exclude,
      linear-gradient(#000 0 0) content-box;
  }
`
