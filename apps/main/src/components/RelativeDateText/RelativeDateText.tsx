import { Text, TextProps } from "@galacticcouncil/ui/components"

import { useRelativeDate } from "@/hooks/useRelativeDate"

export type RelativeDateTextProps = TextProps & {
  date: Date
}

export const RelativeDateText: React.FC<RelativeDateTextProps> = ({
  date,
  ...props
}) => {
  const dateString = useRelativeDate(date)

  return <Text {...props}>{dateString}</Text>
}
