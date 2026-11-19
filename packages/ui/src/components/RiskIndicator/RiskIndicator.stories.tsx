import type { Meta, StoryObj } from "@storybook/react-vite"
import { Fragment } from "react"

import { Grid } from "@/components/Grid"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { RiskIndicator, RiskIndicatorSize, RiskLevel } from "./RiskIndicator"

type Story = StoryObj<typeof RiskIndicator>

export default {
  component: RiskIndicator,
} satisfies Meta<typeof RiskIndicator>

const LEVELS = ["low", "medium", "high"] satisfies RiskLevel[]
const SIZES = ["small", "medium", "large"] satisfies RiskIndicatorSize[]

export const Default: Story = {
  args: {
    level: "medium",
    withLabel: true,
    size: "medium",
  },
}

export const Variants: Story = {
  render: () => (
    <Grid
      columnTemplate={`auto repeat(${SIZES.length * 2}, max-content)`}
      gap="xl"
      align="center"
      justifyItems="end"
      justifyContent="start"
    >
      <span />
      {SIZES.flatMap((size) => [
        <Text key={size} fs="p6" color={getToken("text.medium")}>
          {size}
        </Text>,
        <Text key={`${size}-label`} fs="p6" color={getToken("text.medium")}>
          {size} + label
        </Text>,
      ])}
      {LEVELS.map((level) => (
        <Fragment key={level}>
          <Text fs="p6" color={getToken("text.medium")}>
            {level}
          </Text>
          {SIZES.flatMap((size) => [
            <RiskIndicator key={size} level={level} size={size} />,
            <RiskIndicator
              key={`${size}-label`}
              level={level}
              size={size}
              withLabel
            />,
          ])}
        </Fragment>
      ))}
    </Grid>
  ),
}
