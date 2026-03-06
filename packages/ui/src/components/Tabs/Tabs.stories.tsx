import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"

import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "./Tabs"

const meta = {
  component: TabsRoot,
} satisfies Meta<typeof TabsRoot>

export default meta

type Story = StoryObj<typeof TabsRoot>

export const Default: Story = {
  render: () => (
    <TabsRoot defaultValue="tab1">
      <TabsList>
        <Flex gap="m" mb="m">
          <TabsTrigger value="tab1" asChild>
            <Button>Tab 1</Button>
          </TabsTrigger>
          <TabsTrigger value="tab2" asChild>
            <Button>Tab 2</Button>
          </TabsTrigger>
          <TabsTrigger value="tab3" asChild>
            <Button>Tab 3</Button>
          </TabsTrigger>
        </Flex>
      </TabsList>
      <TabsContent value="tab1">Content for tab 1</TabsContent>
      <TabsContent value="tab2">Content for tab 2</TabsContent>
      <TabsContent value="tab3">Content for tab 3</TabsContent>
    </TabsRoot>
  ),
}
