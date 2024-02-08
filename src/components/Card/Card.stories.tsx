import type { Meta, StoryObj } from "@storybook/react"
import { Card } from "./Card"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import Treasury from "assets/icons/Treasury.svg?react"
import { ComponentPropsWithoutRef } from "react"

type Story = StoryObj<typeof Card>

export default {
  component: Card,
} as Meta<typeof Card>

const MockCard = (props: Partial<ComponentPropsWithoutRef<typeof Card>>) => (
  <Card
    title="Your Rewards"
    icon={<Treasury width={16} height={16} />}
    {...props}
  >
    <div>
      <Text color="basic300" fs={14}>
        Total
      </Text>
      <Text fs={20} lh={28} font="ChakraPetchSemiBold">
        $931.23
      </Text>
      <Button
        variant={
          props.variant === "secondary" || props.variant === "green"
            ? props.variant
            : "primary"
        }
        size="small"
        sx={{ mt: 20 }}
      >
        Claim Rewards
      </Button>
    </div>
  </Card>
)

export const Default: Story = {
  render: MockCard,
}

export const Primary: Story = {
  render: MockCard,
  args: {
    variant: "primary",
  },
}

export const Secondary: Story = {
  render: MockCard,
  args: {
    variant: "secondary",
  },
}

export const Green: Story = {
  render: MockCard,
  args: {
    variant: "green",
  },
}
