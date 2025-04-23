import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"

type Props = {
  icon: ReactNode
  title: string
  description: string
}

export const Step = ({ icon, title, description }: Props) => (
  <div sx={{ width: "100%" }}>
    {icon}
    <Text color="white" sx={{ my: 10 }}>
      {title}
    </Text>
    <Text color="darkBlue200" lh={22}>
      {description}
    </Text>
  </div>
)
