import type { Meta, StoryObj } from "@storybook/react-vite"
import { Link, Search, X } from "lucide-react"
import { useState } from "react"
import { NumberFormatValues } from "react-number-format"

import { Box, Button, Flex, Text } from "@/components"
import { getToken } from "@/utils"

import { Input, InputProps } from "./Input"
import { NumberInput } from "./NumberInput"
import { SearchInput, SearchInputProps } from "./SearchInput"

type Size = NonNullable<InputProps["customSize"]>

const SIZES = ["large", "medium", "small"] satisfies Size[]

const meta = {
  component: Input,
  args: {
    placeholder: "Search tokens...",
    customSize: "medium",
    variant: "standalone",
    isError: false,
    disabled: false,
  },
  argTypes: {
    customSize: { control: "inline-radio", options: SIZES },
    variant: { control: "inline-radio", options: ["standalone", "embedded"] },
    isError: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <Box maxWidth={400}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <Flex direction="column" gap="m">
      {SIZES.map((size) => (
        <Input key={size} {...args} customSize={size} />
      ))}
    </Flex>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <Flex direction="column" gap="m">
      {SIZES.map((size) => (
        <Input
          key={size}
          {...args}
          customSize={size}
          iconStart={Search}
          iconEnd={X}
        />
      ))}
    </Flex>
  ),
}

export const Unit: Story = {
  render: (args) => <Input {...args} placeholder="0" unit="HDX" />,
}

export const CustomElements: Story = {
  render: (args) => (
    <Flex direction="column" gap="m">
      {SIZES.map((size) => (
        <Input
          key={size}
          {...args}
          customSize={size}
          placeholder="Recipient address"
          trailingElement={
            <Button variant="tertiary" size="micro">
              Paste
            </Button>
          }
        />
      ))}
    </Flex>
  ),
}

export const Error: Story = {
  render: (args) => (
    <Flex direction="column" gap="s">
      <Input
        {...args}
        isError
        iconStart={Link}
        defaultValue="https://rpc.hydration.net"
      />
      <Text fs="p6" color={getToken("tags.soft.red.foreground")}>
        The address must start with wss://
      </Text>
    </Flex>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Embedded: Story = {
  render: (args) => <Input {...args} variant="embedded" iconStart={Search} />,
}

const ControlledSearch = (props: SearchInputProps) => {
  const [search, setSearch] = useState(
    props.customSize === "large" ? "" : "HDX",
  )

  return (
    <SearchInput
      {...props}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  )
}

export const SearchField: Story = {
  render: (args) => (
    <Flex direction="column" gap="m">
      {SIZES.map((size) => (
        <ControlledSearch
          key={size}
          customSize={size}
          variant={args.variant}
          disabled={args.disabled}
          placeholder={args.placeholder}
        />
      ))}
    </Flex>
  ),
}

export const Numeric: Story = {
  render: (args) => {
    const [state, setState] = useState<NumberFormatValues | null>(null)

    return (
      <Flex direction="column" gap="m">
        <NumberInput
          customSize={args.customSize}
          variant={args.variant}
          disabled={args.disabled}
          placeholder="Enter a number"
          unit="HDX"
          onValueChange={setState}
        />
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Flex>
    )
  },
}
