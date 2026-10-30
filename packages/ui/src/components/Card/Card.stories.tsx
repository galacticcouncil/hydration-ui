import type { Meta, StoryObj } from "@storybook/react-vite"

import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "./Card"

type Story = StoryObj<typeof Card>

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."

export default {
  component: Card,
} satisfies Meta<typeof Card>

export const Default: Story = {
  render: () => (
    <Card width={500}>
      <CardHeader>
        <CardTitle>Protocol parameters</CardTitle>
        <CardDescription>How DOT is configured in this market.</CardDescription>
      </CardHeader>
      <CardBody>{LOREM_IPSUM}</CardBody>
    </Card>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Card width={500}>
      <CardHeader>
        <CardTitle>My positions</CardTitle>
      </CardHeader>
      <CardBody>{LOREM_IPSUM}</CardBody>
    </Card>
  ),
}
