import { FlexProps, FontProps, MarginProps } from "utils/styles"
import { FC, ReactNode } from "react"
import { ErrorMessage, LabelWrapper, SLabel } from "./Label.styled"

type LabelProps = {
  label: string
  id: string
  children: ReactNode
  error?: string
  withLabel?: boolean
  width?: number
} & MarginProps &
  FlexProps &
  FontProps

export const Label: FC<LabelProps> = ({
  label,
  id,
  children,
  error,
  withLabel = false,
  width,
  ...p
}) => {
  return (
    <LabelWrapper {...p} $width={width}>
      {/* hidden prop hides label visibly, but keeps it available for screen readers */}
      <SLabel error={error} htmlFor={id} hidden={!withLabel} fs={p.fs}>
        {label}
      </SLabel>

      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LabelWrapper>
  )
}
