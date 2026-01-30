import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./NavigationMenu"

type Story = StoryObj<typeof NavigationMenu>

export default {
  component: NavigationMenu,
} satisfies Meta<typeof NavigationMenu>

export type NavigationItem = {
  key: string
  children?: NavigationItem[]
}

export const NAVIGATION: NavigationItem[] = [
  {
    key: "Trade",
    children: [{ key: "Swap" }, { key: "Otc" }],
  },
  {
    key: "Borrow",
    children: [{ key: "Dashboard" }, { key: "Markets" }, { key: "History" }],
  },
  {
    key: "Liquidity",
    children: [
      {
        key: "My Liquidity",
      },
      { key: "Pools" },
    ],
  },
  {
    key: "Wallet",
    children: [{ key: "Assets" }, { key: "Transactions" }],
  },
  {
    key: "Cross-Chain",
  },
  {
    key: "Stats",
    children: [{ key: "Overview" }, { key: "Treasury" }],
  },
  {
    key: "Staking",
  },
  {
    key: "Referrals",
  },
]

const Template = (args: Story["args"]) => (
  <NavigationMenu {...args}>
    <NavigationMenuList>
      {NAVIGATION.map(({ key, children }) => (
        <NavigationMenuItem key={key}>
          <NavigationMenuTrigger>{key}</NavigationMenuTrigger>
          {!!children?.length && (
            <NavigationMenuContent>
              {children.map(({ key }) => (
                <NavigationMenuLink key={key}>{key}</NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          )}
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  </NavigationMenu>
)

export const Default: Story = {
  render: Template,
}
