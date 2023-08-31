import type { Meta, StoryObj } from "@storybook/react"
import { ReactComponent as PolkaLogo } from "assets/icons/PolkadotLogo.svg"

import { Bond } from "./Bond"
import { BondSkeleton } from "./BondSkeleton"

const meta: Meta<typeof Bond> = {
  component: Bond,
}

export default meta
type Story = StoryObj<typeof Bond>

export const List: Story = {
  render: () => (
    <>
      <BondSkeleton view="list" />
      <br />
      <Bond
        view="list"
        title="HDXb08112024"
        icon={<PolkaLogo />}
        discount="10"
        maturity="22.6.2024"
        end="11111111"
        onDetailClick={() => console.log("click")}
      />
    </>
  ),
}

export const Card: Story = {
  render: () => (
    <>
      <BondSkeleton view="card" />
      <br />
      <Bond
        view="card"
        title="HDXb08112024"
        icon={<PolkaLogo />}
        discount="10"
        maturity="22.6.2024"
        end="11111111"
        onDetailClick={() => console.log("click")}
      />
    </>
  ),
}
