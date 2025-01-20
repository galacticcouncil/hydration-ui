import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { AssetLogo } from "./AssetLogo"

type Story = StoryObj<typeof AssetLogo>

export default {
  component: AssetLogo,
} satisfies Meta<typeof AssetLogo>

const Template = (args: React.ComponentPropsWithoutRef<typeof AssetLogo>) => (
  <TooltipProvider>
    <AssetLogo {...args} alt="HDX" />
  </TooltipProvider>
)

export const AssetLogoWithOriginChain: Story = {
  render: Template,
  args: {
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/1000019/icon.svg",
    chainSrc:
      "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const BigAssetLogoWithOriginChain: Story = {
  render: Template,
  args: {
    size: "large",
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/1000019/icon.svg",
    chainSrc:
      "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const SimpleAssetLogo: Story = {
  render: Template,
  args: {
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const SimpleAssetLogoWithRedBadge: Story = {
  render: Template,
  args: {
    badge: "red",
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const SimpleAssetLogoWithYellowBadge: Story = {
  render: Template,
  args: {
    badge: "yellow",
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const SimpleAssetLogoWithYellowBadgeAndTooltip: Story = {
  render: Template,
  args: {
    badge: "yellow",
    badgeTooltip: "Test",
    src: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  },
}

export const NoLogoAsset: Story = {
  render: Template,
}
