import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

    width: 12px;
    height: 12px;

    transform: ${({ expanded }) => `rotate(${expanded ? 0 : -90}deg)`};
  }
`

export const SRawCallData = styled.div`
  font-size: 12px;

  margin-top: 10px;
  padding-left: 16px;

  color: ${theme.colors.darkBlue300};

  overflow-wrap: break-word;

  & > span {
    color: ${theme.colors.brightBlue300};
  }
`
