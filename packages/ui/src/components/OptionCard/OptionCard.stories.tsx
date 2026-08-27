import type { Meta, StoryObj } from "@storybook/react-vite"
import { Repeat2Icon } from "lucide-react"
import { useState } from "react"

import { Flex } from "@/components"

import { OptionCard } from "./OptionCard"

type Story = StoryObj<typeof OptionCard>

const defaultArgs = {
  label: "Market",
  description: "Instant",
  value: "1,234.56 HDX",
  displayValue: "$42.10",
  isActive: false,
  onClick: () => {},
}

export default {
  component: OptionCard,
} satisfies Meta<typeof OptionCard>

const Template = (args: React.ComponentPropsWithoutRef<typeof OptionCard>) => {
  const [isActive, setIsActive] = useState(args.isActive)

  return (
    <Flex width="5xl">
      <OptionCard
        {...args}
        isActive={isActive}
        onClick={() => setIsActive((active) => !active)}
      />
    </Flex>
  )
}

const GroupTemplate = () => {
  const [active, setActive] = useState("market")

  return (
    <Flex direction="column" gap="s" width="5xl">
      <OptionCard
        {...defaultArgs}
        isActive={active === "market"}
        onClick={() => setActive("market")}
      />
      <OptionCard
        label="Limit"
        description="Custom price"
        value="1,200.00 HDX"
        displayValue="$40.92"
        isActive={active === "limit"}
        onClick={() => setActive("limit")}
      />
      <OptionCard
        label="DCA"
        description="Recurring buys"
        value="500.00 HDX"
        displayValue="$17.05"
        isActive={active === "dca"}
        onClick={() => setActive("dca")}
      />
    </Flex>
  )
}

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: defaultArgs,
}

export const Active: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    isActive: true,
  },
}

export const WithIcon: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    icon: Repeat2Icon,
  },
}

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...defaultArgs,
    disabled: true,
  },
}

export const Group: Story = {
  render: () => <GroupTemplate />,
}
