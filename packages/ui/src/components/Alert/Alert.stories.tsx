import type { Meta, StoryFn } from "@storybook/react-vite"

import { Alert } from "./Alert"

export default {
  component: Alert,
} satisfies Meta<typeof Alert>

export const Info: StoryFn = () => {
  return <Alert variant="info" description="This is an info message" />
}

export const WithTitle: StoryFn = () => {
  return (
    <Alert variant="info" title="Info" description="This is an info message" />
  )
}

export const Error: StoryFn = () => {
  return <Alert variant="error" description="This is an error message" />
}

export const Warning: StoryFn = () => {
  return <Alert variant="warning" description="This is a warning message" />
}
