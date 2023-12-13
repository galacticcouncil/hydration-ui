import { FC, ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"
import { SContainer } from "./FeatureBox.styled"

type FeatureBoxProps = {
  label?: ReactNode
  title: ReactNode
  description?: string
  bordered?: boolean
  className?: string
}

export const FeatureBox: FC<FeatureBoxProps> = ({
  label,
  title,
  description,
  bordered = false,
  className,
}) => (
  <SContainer bordered={bordered} className={className}>
    {label && (
      <div
        sx={{ mb: 6, fontSize: 14, color: "basic300" }}
        css={{ whiteSpace: "nowrap" }}
      >
        {label}
      </div>
    )}
    <div>{title}</div>
    {description && (
      <Text color="darkBlue200" sx={{ mt: 6 }} lh={22}>
        {description}
      </Text>
    )}
  </SContainer>
)
