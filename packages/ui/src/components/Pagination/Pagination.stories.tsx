import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Pagination, PaginationProps } from "./Pagination"

type Story = StoryObj<typeof Pagination>

export default {
  component: Pagination,
  title: "Components/Pagination",
} satisfies Meta<typeof Pagination>

const Template = (args: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(args?.currentPage ?? 1)

  return (
    <Pagination
      {...args}
      currentPage={currentPage}
      onPageChange={(page) => {
        setCurrentPage(page)
        args?.onPageChange?.(page)
      }}
    />
  )
}

export const Default: Story = {
  render: Template,
  args: {
    totalPages: 10,
    currentPage: 1,
  },
}

export const ManyPages: Story = {
  render: Template,
  args: {
    totalPages: 9999,
    currentPage: 25,
  },
}

export const SinglePageAlwaysVisible: Story = {
  render: Template,
  args: {
    totalPages: 1,
    currentPage: 1,
    alwaysVisible: true,
  },
}
