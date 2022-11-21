import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { ReactComponent as PasteIcon } from "assets/icons/PasteAddressIcon.svg"
import { theme } from "theme"

export const CloseIcon = styled(IconButton)`
  height: 22px;
  width: 22px;
  background: ${theme.colors.darkBlue900};
  color: ${theme.colors.white};
`

export const PasteAddressIcon = styled(PasteIcon)`
  color: ${theme.colors.basic400};

  :hover {
    cursor: pointer;
  }
`
