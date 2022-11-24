import { Close, Root, Title } from "@radix-ui/react-toast"
import styled from "@emotion/styled"
import { theme } from "theme"
import { motion } from "framer-motion"
import { Maybe } from "utils/helpers"

export const SRoot = styled(Root)`
  position: relative;
  width: 384px;

  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 14px;

  position: relative;
  overflow: hidden;

  padding: 14px;

  background-color: ${theme.colors.backgroundGray1000};
  border-radius: 12px;
`

export const SIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
  }
`

export const STitle = styled(Title)`
  display: flex;
`

export const SClose = styled(Close)`
  position: absolute;
  top: -4px;
  right: -4px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  color: ${theme.colors.neutralGray100};
  background-color: ${theme.colors.backgroundGray800};
  border: none;
  border-radius: 9999px;

  padding: 4px;

  &:hover {
    cursor: pointer;
  }
`

export const SProgressContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  height: 2px;
  background: ${theme.colors.backgroundGray700};

  transform: rotate(180deg);
`

export const SProgressBar = styled(motion.div)<{
  variant: Maybe<"info" | "success" | "error" | "loading">
}>`
  height: 2px;

  background-color: ${({ variant }) =>
    variant === "error" ? theme.colors.red400 : theme.colors.primary500};
`
