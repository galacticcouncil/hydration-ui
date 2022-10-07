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

  border-radius: 9px;
  transition: all 0.15s ease-in-out;

  &:hover {
    cursor: pointer;
    ${({ isActive }) =>
      !isActive && `background-color: ${theme.colors.backgroundGray700};`}
  }
`

export const SText = styled(Text)<{ isActive: boolean }>`
  transition: all 0.3s ease-in-out;
  font-weight: 700;

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

  background: ${theme.gradients.primaryGradient};
  border-radius: 9px;
  transition: all 0.3s ease-in-out;
`
