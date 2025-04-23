import type { Meta, StoryFn } from "@storybook/react"

import { ErrorMessageBar } from "@/components/ErrorMessageBar/ErrorMessageBar"

export default {
  component: ErrorMessageBar,
} satisfies Meta<typeof ErrorMessageBar>

export const Info: StoryFn = () => {
  return (
    <ErrorMessageBar variant="info" description="This is an info message" />
  )
}

export const WithTitle: StoryFn = () => {
  return (
    <ErrorMessageBar
      variant="info"
      title="Info"
      description="This is an info message"
    />
  )
}

export const Error: StoryFn = () => {
  return (
    <ErrorMessageBar variant="error" description="This is an error message" />
  )
}

export const Warning: StoryFn = () => {
  return (
    <ErrorMessageBar
      variant="warning"
      description="This is a warning message"
    />
  )
}
