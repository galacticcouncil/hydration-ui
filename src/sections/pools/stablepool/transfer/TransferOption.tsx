import { ReactNode } from "react"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { SBlock } from "./TransferOption.styled"

type Props = {
  selected: boolean
  children: ReactNode
  heading: string
  subheading: string
  icon: ReactNode
}

export const TransferOption = ({
  selected,
  children,
  heading,
  subheading,
  icon,
}: Props) => (
  <SBlock selected={selected}>
    <div sx={{ flex: "row", align: "center", mb: 26, gap: 12 }}>
      <Icon icon={icon} />
      <Heading fs={15} lh={20} fw={500}>
        {heading}
      </Heading>
    </div>
    <div
      css={{
        borderLeft: `1px solid ${theme.colors.white}`,
        marginBottom: 6,
        paddingLeft: 25,
      }}
    >
      <Text>{subheading}:</Text>
    </div>
    {children}
  </SBlock>
)
