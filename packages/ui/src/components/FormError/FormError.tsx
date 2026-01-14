import { TextProps } from "@/components/Text"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

export const FormError: React.FC<TextProps> = ({
  fs = 12,
  fw = 400,
  color = getToken("accents.danger.secondary"),
  ...props
}) => {
  return <Text fs={fs} fw={fw} color={color} {...props} />
}
