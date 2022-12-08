import styled from "@emotion/styled"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"

export const SSwitch = styled.div`
  --btn-size: 56px;
  --btn-gap: 8px;

  position: relative;
  z-index: ${theme.zIndices.boxSwitch};
  height: var(--btn-size);

  display: flex;
  gap: var(--btn-gap);
`

export const SButton = styled.button<{ isActive: boolean }>`
  all: unset;

  width: var(--btn-size);
  height: var(--btn-size);

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 4px;
  transition: all ${theme.transitions.default};

  cursor: pointer;

  background-color: rgba(${theme.rgbColors.alpha0}, 0.03);

  &:hover {
    ${({ isActive }) =>
      !isActive && `background-color: ${theme.colors.darkBlue401};`}
  }
`

export const SText = styled(Text)<{ isActive: boolean }>`
  transition: all ${theme.transitions.slow};

  ${(props) => {
    if (props.isActive) return { color: theme.colors.black }
    return { color: theme.colors.white }
  }}
`

export const SButtonBackground = styled.div<{ index: number }>`
  ${({ index }) => index === -1 && "display: none;"};

  position: absolute;
  top: 0;
  left: calc(${({ index }) => index} * (var(--btn-size) + var(--btn-gap)));
  z-index: -1;

  width: var(--btn-size);
  height: var(--btn-size);

  background: linear-gradient(0deg, #fc408c -3.48%, #ffb0e4 111.82%);
  border-radius: 4px;
  transition: all ${theme.transitions.slow};
`
