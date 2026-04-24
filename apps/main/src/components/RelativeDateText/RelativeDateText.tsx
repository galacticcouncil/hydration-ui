import { Text, TextProps } from "@galacticcouncil/ui/components"

import { useRelativeDate } from "@/hooks/useRelativeDate"

export type RelativeDateTextProps = TextProps & {
  date: Date
  shortFormat?: boolean
}

export const RelativeDateText: React.FC<RelativeDateTextProps> = ({
  date,
  shortFormat = false,
  ...props
}) => {
  const dateString = useRelativeDate(date, { shortFormat })

  return <Text {...props}>{dateString}</Text>
}
