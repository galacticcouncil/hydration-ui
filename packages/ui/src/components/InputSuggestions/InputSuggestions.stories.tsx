import { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { BookOpen } from "@/assets/icons"
import {
  AccountAvatar,
  AccountInput,
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
} from "@/components"
import { getToken } from "@/utils"

import { InputSuggestions, InputSuggestionsOption } from "./InputSuggestions"

type Story = StoryObj<typeof InputSuggestions>

export default {
  component: InputSuggestions,
  title: "Components/InputSuggestions",
} satisfies Meta<typeof InputSuggestions>

const CONTACTS = [
  {
    name: "Alice",
    address: "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1",
  },
  { name: "Bob", address: "7KATdGaecnKi4zDAMWQxpB2s59N2RE1JgLuugCjTsRZHgP24" },
  { name: "", address: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba" },
]

const Template = () => {
  const [value, setValue] = useState("")

  return (
    <Paper p="xl" maxWidth={500}>
      <InputSuggestions
        anchor={(inputProps) => (
          <AccountInput
            {...inputProps}
            value={value}
            onChange={setValue}
            placeholder="Focus, then use the arrow keys and Enter"
            autoComplete="off"
          />
        )}
      >
        {CONTACTS.map(({ name, address }) => (
          <InputSuggestionsOption
            key={address}
            onSelect={() => setValue(address)}
          >
            <AccountAvatar address={address} size={24} />
            <Flex direction="column" sx={{ minInlineSize: 0 }}>
              {name && <Text fs="p4">{name}</Text>}
              <Text fs="p5" color={getToken("text.medium")} truncate={250}>
                {address}
              </Text>
            </Flex>
          </InputSuggestionsOption>
        ))}
        <Separator />
        <InputSuggestionsOption
          sx={{ gap: "base", color: getToken("text.medium") }}
          onSelect={() => setValue("")}
        >
          <Icon component={BookOpen} size="m" aria-hidden="true" />
          <Text fs="p4">An action row</Text>
        </InputSuggestionsOption>
      </InputSuggestions>
    </Paper>
  )
}

export const Default: Story = {
  render: Template,
}
