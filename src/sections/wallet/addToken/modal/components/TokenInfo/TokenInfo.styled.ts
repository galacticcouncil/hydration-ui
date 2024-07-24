import styled from "@emotion/styled"

export const STokenInfoRow = styled.div<{ expanded?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  padding: 6px 0;

  height: ${({ expanded }) => (expanded ? "auto" : "26px")};
`

export const SLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
`

export const SBadgeCointainer = styled.div`
  position: absolute;

  bottom: -8px;
  right: -4px;

  svg {
    width: 20px;
    height: 20px;
  }
`
