import { useState } from "@storybook/preview-api"
import type { Meta, StoryObj } from "@storybook/react"
import { Search } from "lucide-react"

import { AssetLogo } from "@/components/AssetLogo"
import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Input } from "@/components/Input"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import { Modal, ModalBody, ModalClose, ModalFooter, ModalHeader } from "./Modal"

type Story = StoryObj<typeof Modal>

export default {
  component: Modal,
} as Meta<typeof Modal>

const DefaultTemplate = (args: Story["args"]) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onOpenChange={setOpen}>
        <ModalHeader title="Lorem ipsum" />
        <ModalBody>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda
          eaque iure nostrum numquam illum aperiam quasi possimus explicabo
          quidem atque ipsa, quam sed corporis ullam blanditiis laboriosam in
          labore. Velit.
        </ModalBody>
      </Modal>
    </>
  )
}

const WithHeaderAndFooterTemplate = (args: Story["args"]) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onOpenChange={setOpen}>
        <ModalHeader
          title="Review Transaction"
          description="Transfer 100 DOT from Hydration to Polkadot"
        />
        <ModalBody>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit ipsum
          tenetur modi consequatur qui, soluta ratione eveniet cumque aperiam
          porro numquam perspiciatis voluptatum officia, voluptates ducimus
          tempora obcaecati placeat iure?
        </ModalBody>
        <ModalFooter justify="space-between">
          <ModalClose asChild>
            <Button size="large" variant="secondary">
              Cancel
            </Button>
          </ModalClose>
          <Button size="large" variant="primary">
            Sign transaction
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

const WithCustomHeaderTemplate = (args: Story["args"]) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onOpenChange={setOpen}>
        <ModalHeader
          title="Lorem ipsum"
          customTitle={
            <Box m="var(--modal-content-inset)">
              <Input
                placeholder="Search tokens..."
                variant="embedded"
                customSize="large"
                iconStart={Search}
              />
            </Box>
          }
        />
        <ModalBody p={0}>
          <Box mx="var(--modal-content-inset)" mt="var(--modal-content-inset)">
            {Array.from({ length: 100 }).map((_, i) => (
              <Flex
                key={i}
                py={10}
                px="var(--modal-content-padding)"
                justify="space-between"
                align="center"
              >
                <Flex align="center" gap={8}>
                  <AssetLogo
                    alt="0"
                    src="https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg"
                  />
                  <Text fw={600}>HDX</Text>
                </Flex>
                <Text fs="p6" color={getToken("text.medium")}>
                  $1 000
                </Text>
              </Flex>
            ))}
          </Box>
        </ModalBody>
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: DefaultTemplate,
}

export const DisabledInteractOutside: Story = {
  render: DefaultTemplate,
  args: {
    disableInteractOutside: true,
  },
}

export const WithHeaderAndFooter: Story = {
  render: WithHeaderAndFooterTemplate,
}

export const WithCustomHeader: Story = {
  render: WithCustomHeaderTemplate,
}

export const ForcedDrawerVariant: Story = {
  render: WithCustomHeaderTemplate,
  args: {
    variant: "drawer",
  },
}

export const ForcedPopupVariant: Story = {
  render: WithCustomHeaderTemplate,
  args: {
    variant: "popup",
  },
}
