import styled from "@emotion/styled"
import { ReactNode } from "react"
import { ReactComponent as ErrorIcon } from "assets/icons/ErrorIcon.svg"
import { ReactComponent as WarningIcon } from "assets/icons/WarningIcon.svg"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

const SContainer = styled.div<{ variant: "warning" | "error" }>`
  padding: 16px;
  display: grid;
  grid-template-columns: auto 1fr;

  border-radius: 8px;
  gap: 12px;

  ${({ variant }) => {
    switch (variant) {
      case "error": {
        return { backgroundColor: `rgba(${theme.rgbColors.red400}, 0.3)` }
      }
      case "warning": {
        return { backgroundColor: `rgba(${theme.rgbColors.yellow400}, 0.5)` }
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
    <SContainer variant={props.variant}>
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
