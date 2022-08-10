import { FlexProps, FontProps, MarginProps } from "common/styles"
import { FC, ReactNode } from "react"
import { ErrorMessage, LabelWrapper, StyledLabel } from "./Label.styled"

type LabelProps = {
  label: string
  id: string
  children: ReactNode
  showError?: boolean
  error?: string
  withLabel?: boolean
  width?: number
} & MarginProps &
  FlexProps &
  FontProps

export const Label: FC<LabelProps> = ({
  label,
  id,
  showError,
  children,
  error,
  withLabel = false,
  width,
  ...p
}) => {
  console.log("p label", id, p)
  return (
    <LabelWrapper {...p} $width={width}>
      {/* hidden prop hides label visibly, but keeps it available for screen readers */}
      <StyledLabel
        showError={showError}
        htmlFor={id}
        hidden={!withLabel}
        fs={p.fs}
      >
        {label}
      </StyledLabel>

      {children}
      {showError && <ErrorMessage>{error}</ErrorMessage>}
    </LabelWrapper>
  )
}
