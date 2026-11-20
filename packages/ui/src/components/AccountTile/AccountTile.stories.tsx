import { Meta, StoryFn } from "@storybook/react-vite"

import { AccountTile, Button } from "@/components"

export default {
  component: AccountTile,
} as Meta<typeof AccountTile>

export const Default: StoryFn = () => {
  return (
    <AccountTile
      name="account-name"
      address="0x278b77bb127081cad7beca2d7b863c459a436dd6"
      value="$100.21"
    />
  )
}

export const Active: StoryFn = () => {
  return (
    <AccountTile
      name="account-name"
      address="0x278b77bb127081cad7beca2d7b863c459a436dd6"
      value="$100.21"
      active
    />
  )
}

export const WithAction: StoryFn = () => {
  return (
    <AccountTile
      name="account-name"
      address="0x278b77bb127081cad7beca2d7b863c459a436dd6"
      action={
        <Button variant="secondary" outline size="small">
          Change
        </Button>
      }
    />
  )
}

export const Empty: StoryFn = () => {
  return (
    <AccountTile
      name="No account selected"
      address=""
      action={
        <Button variant="secondary" outline size="small">
          Select
        </Button>
      }
    />
  )
}
