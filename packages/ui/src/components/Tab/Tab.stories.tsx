import { Meta } from "@storybook/react"

import { Tab } from "@/components/Tab/Tab"

export default {
  component: Tab,
} satisfies Meta<typeof Tab>

export const Default = () => <Tab isActive>Tab</Tab>

export const Large = () => <Tab size="large">Tab</Tab>
