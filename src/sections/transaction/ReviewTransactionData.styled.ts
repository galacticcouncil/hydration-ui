import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;

  > div {
    width: 100%;
  }
`

export const SExpandButton = styled(ButtonTransparent)<{
  expanded: boolean
}>`
  font-size: 12px;

  color: ${theme.colors.brightBlue300};

  & > svg {
    margin-right: 4px;

    width: 11px;
    height: 11px;

    transform: ${({ expanded }) => `rotate(${expanded ? 0 : -90}deg)`};
  }
`

export const SShowMoreButton = styled(ButtonTransparent)`
  font-size: 12px;
  text-align: center;
  text-decoration: underline;

  width: 100%;

  padding: 6px 0 0;

  color: ${theme.colors.brightBlue300};

  background: linear-gradient(
    to bottom,
    rgba(24, 28, 41, 0),
    rgba(24, 28, 41, 1)
  );

  :hover {
    color: ${theme.colors.brightBlue200Alpha};
  }
`

export const SRawCallData = styled.div`
  font-size: 12px;

  margin-top: 10px;
  padding-left: 16px;

  color: ${theme.colors.darkBlue300};

  overflow-wrap: break-word;

  font-variant: tabular-nums;

  & > span {
    color: ${theme.colors.brightBlue300};
  }
`
