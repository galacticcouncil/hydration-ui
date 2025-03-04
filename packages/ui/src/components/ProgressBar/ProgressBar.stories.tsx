import { Meta, StoryFn } from "@storybook/react"

import { ProgressBar } from "@/components/ProgressBar/ProgressBar"

export default {
  title: "components/ProgressBar",
} as Meta

export const ProgressBarSmall: StoryFn = () => {
  return <ProgressBar size="small" value={15} />
}

export const ProgressBarLarge: StoryFn = () => {
  return <ProgressBar size="large" value={15} />
}
