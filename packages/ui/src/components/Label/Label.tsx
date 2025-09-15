import { Text, TextProps } from "@/components"

export type LabelProps = Omit<TextProps, "as"> &
  Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "color">

export const Label: React.FC<LabelProps> = (props) => {
  return <Text as="label" {...props} />
}
