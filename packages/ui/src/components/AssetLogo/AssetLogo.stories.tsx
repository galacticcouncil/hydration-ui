import { METADATA_CDN_URL } from "@galacticcouncil/utils"
import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Stack } from "@/components/Stack"

import { AssetLogo, MultipleAssetLogoWrapper } from "./AssetLogo"

type Story = StoryObj<typeof AssetLogo>

export default {
  component: AssetLogo,
} satisfies Meta<typeof AssetLogo>

const ETH_SRC = `${METADATA_CDN_URL}/v2/ethereum/1/icon.svg`
const AAVE_SRC = `${METADATA_CDN_URL}/v2/ethereum/1/assets/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9/icon.svg`
const HDX_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/0/icon.svg`
const USDT_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/10/icon.svg`
const TBTC_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/1000765/icon.svg`
const HOLLAR_SRC = `${METADATA_CDN_URL}/v2/polkadot/2034/assets/222/icon.svg`

const Template = (args: React.ComponentPropsWithoutRef<typeof AssetLogo>) => (
  <Stack gap="xl">
    <AssetLogo {...args} size="extra-small" />
    <AssetLogo {...args} size="small" />
    <AssetLogo {...args} size="medium" />
    <AssetLogo {...args} size="large" />
    <AssetLogo {...args} size="extra-large" />
  </Stack>
)

const MultipleAssetsTemplate = (
  args: Omit<
    React.ComponentPropsWithoutRef<typeof MultipleAssetLogoWrapper>,
    "children"
  >,
) => (
  <MultipleAssetLogoWrapper {...args}>
    <AssetLogo src={HDX_SRC} />
    <AssetLogo src={AAVE_SRC} />
    <AssetLogo src={ETH_SRC} />
    <AssetLogo src={USDT_SRC} />
  </MultipleAssetLogoWrapper>
)

export const Default: Story = {
  render: Template,
  args: {
    src: HDX_SRC,
  },
}

export const WithChain: Story = {
  render: Template,
  args: {
    src: AAVE_SRC,
    chainSrc: ETH_SRC,
  },
}

export const WithSideChain: Story = {
  render: (args) => (
    <Stack gap="xl">
      <Template {...args} />
      <Template {...args} decoration="atoken" />
      <Stack gap="xl">
        <MultipleAssetsTemplate size="extra-small" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="small" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="medium" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="large" chainSrc={ETH_SRC} />
        <MultipleAssetsTemplate size="extra-large" chainSrc={ETH_SRC} />
      </Stack>
      <Stack gap="xl">
        {[2, 3, 4].map((count) => (
          <MultipleAssetLogoWrapper
            key={count}
            size="large"
            chainSrc={ETH_SRC}
            collapsed
          >
            {[HDX_SRC, AAVE_SRC, ETH_SRC, USDT_SRC]
              .slice(0, count)
              .map((src) => (
                <AssetLogo key={src} src={src} />
              ))}
          </MultipleAssetLogoWrapper>
        ))}
      </Stack>
    </Stack>
  ),
  args: {
    src: AAVE_SRC,
    chainSrc: ETH_SRC,
    chainPosition: "side",
  },
}

export const WithMultipleAssets: Story = {
  render: () => (
    <Stack gap="xl">
      <MultipleAssetsTemplate size="extra-small" />
      <MultipleAssetsTemplate size="small" />
      <MultipleAssetsTemplate size="medium" />
      <MultipleAssetsTemplate size="large" />
      <Stack gap="xl">
        {(
          ["extra-small", "small", "medium", "large", "extra-large"] as const
        ).map((size) => (
          <MultipleAssetLogoWrapper key={size} size={size}>
            <AssetLogo src={TBTC_SRC} chainSrc={ETH_SRC} decoration="atoken" />
            <AssetLogo src={HOLLAR_SRC} />
          </MultipleAssetLogoWrapper>
        ))}
      </Stack>
    </Stack>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <Stack gap="xl">
      {[2, 3, 4].map((count) => (
        <Stack
          key={count}
          direction="row"
          gap="xl"
          align="center"
          justify="start"
        >
          {(
            ["extra-small", "small", "medium", "large", "extra-large"] as const
          ).map((size) => (
            <MultipleAssetLogoWrapper key={size} size={size} collapsed>
              {[HDX_SRC, AAVE_SRC, ETH_SRC, USDT_SRC]
                .slice(0, count)
                .map((src) => (
                  <AssetLogo key={src} src={src} chainSrc={ETH_SRC} />
                ))}
            </MultipleAssetLogoWrapper>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

export const WithAtokenDecoration: Story = {
  render: (args) => (
    <Stack gap="xl">
      <Template {...args} />
      <MultipleAssetsTemplate decoration={args.decoration} size="extra-small" />
      <MultipleAssetsTemplate decoration={args.decoration} size="small" />
      <MultipleAssetsTemplate decoration={args.decoration} size="medium" />
      <MultipleAssetsTemplate decoration={args.decoration} size="large" />
    </Stack>
  ),
  args: {
    decoration: "atoken",
    src: AAVE_SRC,
  },
}

export const Placeholder: Story = {
  render: Template,
}
