import { ReactNode } from "react"
import ErrorIcon from "assets/icons/ErrorIcon.svg?react"
import WarningIcon from "assets/icons/WarningIcon.svg?react"
import InfoIcon from "assets/icons/LPInfoIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import { SContainer } from "./Alert.styled"

export type AlertVariant = "warning" | "error" | "info"
export type AlertSize = "small" | "medium" | "large"

export type AlertProps = {
  className?: string
  variant: AlertVariant
  size?: AlertSize
  children?: ReactNode
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  size = "medium",
  className,
  children,
}) => {
  return (
    <SContainer variant={variant} size={size} className={className}>
      {variant === "error" && <ErrorIcon />}
      {variant === "warning" && <WarningIcon />}
      {variant === "info" && <InfoIcon />}

      <div sx={{ flex: "column" }}>
        {typeof children === "string" ? (
          <Text fs={12} lh={16} fw={500}>
            {children}
          </Text>
        ) : (
          children
        )}
      </div>
    </SContainer>
  )
}
