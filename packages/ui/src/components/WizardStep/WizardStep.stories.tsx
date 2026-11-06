import { METADATA_CDN_URL } from "@galacticcouncil/utils"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { AssetLogo } from "@/components/AssetLogo"
import { Separator } from "@/components/Separator"
import { Stack } from "@/components/Stack"

import { WizardStep } from "./WizardStep"

type Story = StoryObj<typeof WizardStep>

const HDX_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/0/icon.svg`

export default {
  component: WizardStep,
} satisfies Meta<typeof WizardStep>

export const Active: Story = {
  args: {
    stepNumber: 1,
    state: "active",
    title: "Collateral",
    description: "Asset you deposit and multiply",
  },
}

export const Done: Story = {
  args: { ...Active.args, state: "done", description: "WETH" },
}

export const Todo: Story = {
  args: { ...Active.args, stepNumber: 2, state: "todo", title: "Borrow" },
}

export const Steps: Story = {
  render: () => (
    <Stack>
      <WizardStep
        stepNumber={1}
        state="done"
        title="Collateral"
        description="WETH"
      />
      <Separator />
      <WizardStep
        stepNumber={2}
        state="active"
        title="Borrow"
        description="Asset you borrow to loop"
      />
      <Separator />
      <WizardStep stepNumber={3} state="todo" title="Review" />
    </Stack>
  ),
}

export const DoneWithIcon: Story = {
  args: {
    ...Done.args,
    icon: <AssetLogo src={HDX_SRC} size="medium" />,
  },
}
