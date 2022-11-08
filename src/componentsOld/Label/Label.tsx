import { FC, ReactNode } from "react"
import { ErrorMessage, LabelWrapper, SLabel } from "./Label.styled"

type LabelProps = {
  label: string
  id: string
  children: ReactNode
  error?: string
  withLabel?: boolean
  className?: string
}

export const Label: FC<LabelProps> = ({
  label,
  id,
  children,
  error,
  withLabel = false,
  ...p
}) => {
  return (
    <LabelWrapper {...p}>
      {/* hidden prop hides label visibly, but keeps it available for screen readers */}
      <SLabel error={error} htmlFor={id} hidden={!withLabel}>
        {label}
      </SLabel>

      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LabelWrapper>
  )
}
