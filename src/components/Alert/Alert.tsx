import styled from "@emotion/styled"
import { ReactNode } from "react"
import ErrorIcon from "assets/icons/ErrorIcon.svg?react"
import WarningIcon from "assets/icons/WarningIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

const SContainer = styled.div<{ variant: "warning" | "error" }>`
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;

  border-radius: 2px;
  gap: 12px;

  ${({ variant }) => {
    switch (variant) {
      case "error": {
        return { backgroundColor: `rgba(${theme.rgbColors.red100}, 0.25)` }
      }
      case "warning": {
        return { backgroundColor: `rgba(${theme.rgbColors.warning200}, 0.4)` }
      }
    }
  }}
`

export function Alert(props: {
  className?: string
  variant: "warning" | "error"
  children?: ReactNode
}) {
  return (
    <SContainer variant={props.variant} className={props.className}>
      {props.variant === "error" && <ErrorIcon />}
      {props.variant === "warning" && <WarningIcon />}

      <div sx={{ flex: "column" }}>
        {typeof props.children === "string" ? (
          <Text fs={12} lh={16} fw={500}>
            {props.children}
          </Text>
        ) : (
          props.children
        )}
      </div>
    </SContainer>
  )
}
