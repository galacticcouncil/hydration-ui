import { MouseEventHandler, ReactNode } from "react"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { SBlock } from "./PathOption.styled"
import { CheckBox } from "./CheckBox"

type Props = {
  selected: boolean
  onSelect: MouseEventHandler<HTMLDivElement>
  children: ReactNode
  heading: string
  subheading?: string
  icon: ReactNode
}

export const PathOption = ({
  selected,
  onSelect,
  children,
  heading,
  subheading,
  icon,
}: Props) => (
  <SBlock selected={selected} onClick={onSelect}>
    <div
      sx={{ flex: "row", align: "center", justify: "space-between", mb: 26 }}
    >
      <div sx={{ flex: "row", align: "center", gap: 12, color: "white" }}>
        <Icon icon={icon} />
        <Heading fs={15} lh={20} fw={500}>
          {heading}
        </Heading>
      </div>
      <CheckBox selected={selected} />
    </div>
    {subheading && (
      <div
        css={{
          borderLeft: `1px solid ${theme.colors.white}`,
          marginBottom: 6,
          paddingLeft: 25,
        }}
      >
        <Text>{subheading}:</Text>
      </div>
    )}
    {children}
  </SBlock>
)
