import type { Meta, StoryObj } from "@storybook/react"
import PolkaLogo from "assets/icons/PolkadotLogo.svg?react"

import { Bond } from "./Bond"

const meta: Meta<typeof Bond> = {
  component: Bond,
}

export default meta
type Story = StoryObj<typeof Bond>

export const Default: Story = {
  render: () => (
    <>
      <Bond
        view="list"
        title="HDXb08112024"
        icon={<PolkaLogo />}
        discount="10"
        maturity="22.6.2024"
        endingIn="23H 22m"
        onDetailClick={() => console.log("click")}
      />
      <br />
      <Bond
        view="card"
        title="HDXb08112024"
        icon={<PolkaLogo />}
        discount="10"
        maturity="22.6.2024"
        endingIn="23H 22m"
        onDetailClick={() => console.log("click")}
      />
    </>
  ),
}
