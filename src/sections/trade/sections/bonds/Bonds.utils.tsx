import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { ReactComponent as TickIcon } from "assets/icons/TickIcon.svg"
import { ReactComponent as DollarIcon } from "assets/icons/Dollar2Icon.svg"
import { ReactNode } from "react"
import { format } from "date-fns"

const steps = ["first", "second", "third"] as const

export const whyBonds: Array<{
  index: (typeof steps)[number]
  icon: ReactNode
}> = [
  {
    index: "first",
    icon: <TickIcon sx={{ color: "vibrantBlue200" }} />,
  },
  {
    index: "second",
    icon: <ClockIcon sx={{ color: "brightBlue300" }} />,
  },
  {
    index: "third",
    icon: <DollarIcon sx={{ color: "green600" }} />,
  },
]

export const getBondName = (symbol: string, date: Date, long?: boolean) =>
  `${symbol.toLocaleUpperCase()}${long ? " Bond" : "b"} ${format(
    date,
    "dd/MM/yyyy",
  )}`
