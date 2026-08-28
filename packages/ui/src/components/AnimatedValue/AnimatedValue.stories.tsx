import { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentPropsWithoutRef, useEffect, useState } from "react"

import { AnimatedValue } from "./AnimatedValue"

type Story = StoryObj<typeof AnimatedValue>

export default {
  component: AnimatedValue,
} as Meta<typeof AnimatedValue>

const format = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`

const Template = (props: ComponentPropsWithoutRef<typeof AnimatedValue>) => (
  <span
    sx={{
      fontSize: "h3",
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
    }}
  >
    <AnimatedValue {...props} />
  </span>
)

const LiveTemplate = ({
  value,
  ...props
}: ComponentPropsWithoutRef<typeof AnimatedValue>) => {
  const [price, setPrice] = useState(value)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((current) => current * (1 + (Math.random() - 0.5) * 0.2))
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return <Template {...props} value={price} />
}

export const Default: Story = {
  render: LiveTemplate,
  args: {
    value: 1234.56,
    format,
  },
}

export const ValueFlash: Story = {
  render: LiveTemplate,
  args: {
    value: 1234.56,
    valueFlash: true,
    format,
  },
}

export const CustomDuration: Story = {
  render: LiveTemplate,
  args: {
    value: 1234.56,
    duration: 2000,
    valueFlash: true,
    format,
  },
}
