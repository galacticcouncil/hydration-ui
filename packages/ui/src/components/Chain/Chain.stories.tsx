import { Meta, StoryFn } from "@storybook/react-vite"
import { PiIcon } from "lucide-react"

import { Chain } from "./Chain"

export default {
  component: Chain,
} satisfies Meta<typeof Chain>

export const Desktop: StoryFn = () => {
  return <Chain icon={PiIcon} name="Ethereum" />
}

export const Mobile: StoryFn = () => {
  return <Chain icon={PiIcon} name="Ethereum" variant="mobile" />
}
