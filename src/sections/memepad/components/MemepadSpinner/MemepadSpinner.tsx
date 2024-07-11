import { Spinner } from "components/Spinner/Spinner"
import { Text } from "components/Typography/Text/Text"

export type MemepadSpinnerProps = {
  title?: string
  description?: string
}

export const MemepadSpinner: React.FC<MemepadSpinnerProps> = ({
  title,
  description,
}) => {
  return (
    <div sx={{ maxWidth: 500, mx: "auto", my: 50 }}>
      <Spinner size={120} sx={{ mx: "auto", mb: 30 }} />
      {title && (
        <Text tAlign="center" fs={19} font="GeistMono" sx={{ mb: 10 }}>
          {title}
        </Text>
      )}
      {description && (
        <Text tAlign="center" color="basic400">
          {description}
        </Text>
      )}
    </div>
  )
}
