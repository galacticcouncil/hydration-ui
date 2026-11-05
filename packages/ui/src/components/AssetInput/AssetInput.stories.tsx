import * as Popover from "@radix-ui/react-popover"
import { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { FiatEur, FiatUsd } from "@/assets/icons"
import { getToken } from "@/utils"

import { Box } from "../Box"
import { Logo } from "../Logo"
import { Paper } from "../Paper"
import { SContent } from "../Popover"
import { Select } from "../Select"
import { Stack } from "../Stack"
import { AssetButton, AssetInput, AssetInputProps } from "./AssetInput"

type Story = StoryObj<typeof AssetInput>

export default {
  component: AssetInput,
} satisfies Meta<typeof AssetInput>

const SPOT_PRICE = 0.1234
const MAX_BALANCE = "12345"

const HDX = {
  symbol: "HDX",
  icon: (
    <Logo src="https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@master/v2/polkadot/2034/assets/0/icon.svg" />
  ),
}

const Field = (args: AssetInputProps) => {
  const [value, setValue] = useState("")

  return (
    <AssetInput
      label="Sell"
      asset={HDX}
      onAssetClick={() => {}}
      value={value}
      onChange={setValue}
      displayValue={value ? `$${(Number(value) * SPOT_PRICE).toFixed(2)}` : ""}
      balance={{
        label: "Balance",
        value: MAX_BALANCE,
        onMax: () => setValue(MAX_BALANCE),
        withPercentageButton: true,
        onPercentage: (percent) =>
          setValue(String((Number(MAX_BALANCE) * percent) / 100)),
      }}
      {...args}
    />
  )
}

const Frame = ({ children }: { children: React.ReactNode }) => (
  <Box
    width={500}
    bg={getToken("surfaces.themeBasePalette.surfaceHigh")}
    p="xxl"
  >
    {children}
  </Box>
)

const render = (args: AssetInputProps) => (
  <Frame>
    <Field {...args} />
  </Frame>
)

export const Default: Story = { render }

export const StackedSelector: Story = {
  render,
  args: { assetSelectorLayout: "stacked" },
}

export const Empty: Story = { render, args: { asset: null } }

export const AmountError: Story = {
  render,
  args: { value: "1234", amountError: "Not enough balance" },
}

export const AssetError: Story = {
  render,
  args: { asset: null, assetError: "Select an asset" },
}

export const Loading: Story = { render, args: { isLoading: true } }

export const ValueLoading: Story = {
  render,
  args: { value: "12", isValueLoading: true, isDisplayValueLoading: true },
}

export const BalanceLoading: Story = {
  render,
  args: { balance: { label: "Balance", value: "", isLoading: true } },
}

export const ReadOnly: Story = {
  render,
  args: { value: "42", isReadOnly: true },
}

export const Disabled: Story = { render, args: { isDisabled: true } }

export const AmountHidden: Story = {
  render,
  args: { label: "Buy", balance: undefined, isAmountHidden: true },
}

export const CurrencySelector: Story = {
  render: function Render(args) {
    const [currency, setCurrency] = useState<"USD" | "EUR">("USD")

    return (
      <Frame>
        <Field
          {...args}
          label="You send from your bank"
          balance={undefined}
          assetSelector={
            <Select<"USD" | "EUR">
              aria-label="Bank currency"
              value={currency}
              onValueChange={setCurrency}
              variant="secondary"
              outline
              size="medium"
              iconSize={24}
              items={[
                { key: "USD", label: "USD · ACH / wire", icon: FiatUsd },
                { key: "EUR", label: "EUR · SEPA", icon: FiatEur },
              ]}
            />
          }
        />
      </Frame>
    )
  },
}

export const AllStates: Story = {
  render: () => (
    <Frame>
      <Stack gap="xl">
        <Field />
        <Field isLoading />
        <Field asset={null} />
        <Field value="1234" amountError="Not enough balance" />
        <Field asset={null} assetError="Select an asset" />
        <Field value="12" isValueLoading isDisplayValueLoading />
        <Field isDisabled />
      </Stack>
    </Frame>
  ),
}

export const PopoverSelector: Story = {
  render: (args) => (
    <Frame>
      <Popover.Root>
        <Field
          {...args}
          assetSelector={
            <Popover.Trigger asChild>
              <AssetButton asset={HDX} aria-label="Select asset" />
            </Popover.Trigger>
          }
        />
        <Popover.Portal>
          <SContent sideOffset={8}>
            <Paper p="m">Asset selector content</Paper>
          </SContent>
        </Popover.Portal>
      </Popover.Root>
    </Frame>
  ),
}
