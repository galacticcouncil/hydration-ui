import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { useState } from "@storybook/preview-api"
import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Notification } from "@/components/Notification"
import { getToken } from "@/utils"

import { Sheet } from "./Sheet"

type Story = StoryObj<typeof Sheet>

export default {
  component: Sheet,
} as Meta<typeof Sheet>

const DefaultTemplate = (args: Story["args"]) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet title="Notifications" {...args} open={open} onOpenChange={setOpen}>
        <Flex direction="column" gap="base">
          {Array.from({ length: 10 }).map((_, i) => (
            <Fragment key={i}>
              <Notification
                sx={{
                  width: "100%",
                  bg: getToken("surfaces.containers.dim.dimOnBg"),
                }}
                autoClose={false}
                variant="success"
                content="Transaction sucessful"
              />
              <Notification
                sx={{
                  width: "100%",
                  bg: getToken("surfaces.containers.dim.dimOnBg"),
                }}
                autoClose={false}
                variant="error"
                content="Transaction failed"
              />
              <Notification
                sx={{
                  width: "100%",
                  bg: getToken("surfaces.containers.dim.dimOnBg"),
                }}
                autoClose={false}
                variant="unknown"
                content="Transaction pending"
              />
            </Fragment>
          ))}
        </Flex>
      </Sheet>
    </>
  )
}

export const Default: Story = {
  render: DefaultTemplate,
}
