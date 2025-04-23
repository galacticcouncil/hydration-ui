import { Heading } from "components/Typography/Heading/Heading"
import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const PageHeading: React.FC<Props> = ({ children }) => {
  return (
    <Heading as="h1" fs={21} lh={21} fw={500}>
      {children}
    </Heading>
  )
}
