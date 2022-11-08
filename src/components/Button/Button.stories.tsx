import React from "react"
import { ComponentMeta } from "@storybook/react"
import { Button } from "./Button"

// TODO config properly

export default {
  title: "components/Button/Button",
  component: Button,
} as ComponentMeta<typeof Button>

export const Primary = () => (
  <>
    <Button variant="primary">Button primary</Button>
  </>
)
export const PrimarySmall = () => (
  <Button variant="primary" size="small">
    Button primary
  </Button>
)
export const PrimaryDisabled = () => (
  <>
    <Button variant="primary" disabled>
      Button primary
    </Button>
  </>
)
export const Secondary = () => <Button>Button primary</Button>
export const Loading = () => <Button isLoading>Button primary</Button>
export const Gradient = () => <Button variant="gradient">Button primary</Button>
export const TabLink = () => (
  <Button
    variant="outline"
    sx={{
      p: "12px 34px",
    }}
  >
    Assets
  </Button>
)
export const TabLinkActive = () => (
  <Button
    variant="outline"
    active={true}
    sx={{
      p: "12px 34px",
    }}
  >
    Assets
  </Button>
)
