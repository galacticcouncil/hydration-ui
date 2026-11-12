import type { Meta, StoryObj } from "@storybook/react-vite"
import React, { Fragment } from "react"

import { Flex, Grid, Text } from "@/components"
import { getToken } from "@/utils"

import { Chip } from "./Chip"
import { ChipSize, ChipVariant } from "./Chip.styled"

type Story = StoryObj<typeof Chip>

export default {
  component: Chip,
} satisfies Meta<typeof Chip>

const VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "info",
  "success",
  "warning",
  "danger",
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "purple",
  "pink",
  "indigo",
  "violet",
  "stone",
  "slate",
] satisfies ChipVariant[]

const SIZES = ["large", "medium", "small", "extra-small"] satisfies ChipSize[]

const Template = (args: React.ComponentPropsWithoutRef<typeof Chip>) => (
  <Flex gap="xl" align="center">
    <Chip {...args} size="large">
      Voted
    </Chip>
    <Chip {...args} size="medium">
      Voted
    </Chip>
    <Chip {...args} size="small">
      Voted
    </Chip>
  </Flex>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text fs="p6" color={getToken("text.medium")}>
    {children}
  </Text>
)

export const Default: Story = {
  render: Template,
}

export const Rounded: Story = {
  render: Template,
  args: {
    variant: "primary",
    rounded: true,
  },
}

export const Variants: Story = {
  render: () => (
    <Grid
      columnTemplate={`auto repeat(${SIZES.length + 1}, max-content)`}
      gap="xl"
      align="center"
      justifyContent="start"
      justifyItems="start"
    >
      <span />
      {SIZES.map((size) => (
        <Label key={size}>{size}</Label>
      ))}
      <Label>rounded</Label>
      {VARIANTS.map((variant) => (
        <Fragment key={variant}>
          <Label>{variant}</Label>
          {SIZES.map((size) => (
            <Chip key={size} variant={variant} size={size}>
              Voted
            </Chip>
          ))}
          <Chip variant={variant} rounded>
            Voted
          </Chip>
        </Fragment>
      ))}
    </Grid>
  ),
}
