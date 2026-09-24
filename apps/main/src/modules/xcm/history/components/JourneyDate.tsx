import { TextProps } from "@galacticcouncil/ui/components"

import { DateText } from "@/components/RelativeDateText"

export type JourneyDateProps = TextProps & {
  timestamp: number
}

export const JourneyDate: React.FC<JourneyDateProps> = ({
  timestamp,
  ...props
}) => {
  return <DateText date={new Date(timestamp)} {...props} />
}
