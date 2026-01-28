import { Flex, FlexProps } from "@/components/Flex"
import { Text, TextProps } from "@/components/Text"
import { getToken } from "@/utils"

export const FormLabel: React.FC<TextProps> = (props) => (
  <Text fs="p5" fw={400} color={getToken("text.medium")} {...props} />
)

export const FormError: React.FC<TextProps> = (props) => (
  <Text
    fs="p5"
    fw={400}
    color={getToken("accents.danger.secondary")}
    {...props}
  />
)

export type FormFieldProps = {
  label?: string
  error?: string
  children: React.ReactNode
} & FlexProps

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  ...props
}) => {
  return (
    <Flex as="label" direction="column" gap="s" {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {error && <FormError>{error}</FormError>}
    </Flex>
  )
}
