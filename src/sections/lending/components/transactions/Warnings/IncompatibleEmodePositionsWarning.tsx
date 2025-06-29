import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

export type IncompatibleEmodePositionsWarningProps = {
  className?: string
  title?: string
  eModeLabel?: string
}

export const IncompatibleEmodePositionsWarning: React.FC<
  IncompatibleEmodePositionsWarningProps
> = ({ eModeLabel, className, title }) => {
  return (
    <Alert variant="warning" className={className}>
      {title && (
        <Text fs={14} font="GeistSemiBold" sx={{ mb: 4 }}>
          {title}
        </Text>
      )}
      <Text fs={13}>
        To enable E-mode for the {eModeLabel} category, all borrow positions
        outside of this category must be closed.
      </Text>
    </Alert>
  )
}
