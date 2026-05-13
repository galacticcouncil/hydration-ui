import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Expander } from "@/components/Expander"
import { Text } from "@/components/Text"

type Story = StoryObj<typeof Expander>

export default {
  component: Expander,
} satisfies Meta<typeof Expander>

export const Default: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false)
    return (
      <Box>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
        <Expander expanded={expanded}>
          <Text fs="p4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos
            enim quia ex provident aut explicabo voluptatem totam suscipit
            perferendis, reprehenderit quo modi repudiandae illo voluptas
            repellendus repellat sequi a asperiores?
          </Text>
        </Expander>
      </Box>
    )
  },
}
