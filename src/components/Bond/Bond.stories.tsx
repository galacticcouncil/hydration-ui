import type { Meta, StoryObj } from "@storybook/react"
import PolkaLogo from "assets/icons/PolkadotLogo.svg?react"

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
        ticker="HDX Bond 08/11/2024"
        name="HDXb"
        maturity="22.6.2024"
        end={11111111}
        start={1111100}
        assetId="0"
        bondId="1000018"
        state="active"
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
        view="list"
        ticker="HDX Bond 08/11/2024"
        name="HDXb"
        maturity="22.6.2024"
        end={11111111}
        start={1111100}
        assetId="0"
        bondId="1000018"
        state="active"
      />
    </>
  ),
}
