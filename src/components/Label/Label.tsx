import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { FC, ReactNode } from "react"
import { ErrorMessage, LabelWrapper, SInfoIcon, SLabel } from "./Label.styled"

type LabelProps = {
  label: string
  id: string
  children: ReactNode
  error?: string
  withLabel?: boolean
  className?: string
  tooltip?: string
}

export const Label: FC<LabelProps> = ({
  label,
  id,
  children,
  error,
  withLabel = false,
  tooltip,
  ...p
}) => {
  return (
    <LabelWrapper {...p}>
      {/* hidden prop hides label visibly, but keeps it available for screen readers */}
      <div sx={{ flex: "row", justify: "space-between" }}>
        <SLabel error={error} htmlFor={id} hidden={!withLabel}>
          {label}
        </SLabel>
        {tooltip && (
          <InfoTooltip text={tooltip}>
            <SInfoIcon />
          </InfoTooltip>
        )}
      </div>

      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LabelWrapper>
  )
}
