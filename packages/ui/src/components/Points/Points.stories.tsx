import { Meta, StoryFn } from "@storybook/react"

import { Points } from "@/components/Points/Points"

export default {
  component: Points,
} satisfies Meta<typeof Points>

export const PointsStory: StoryFn = () => {
  return <Points number={1} title="Points" description="Points" />
}
