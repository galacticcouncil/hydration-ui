import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import * as React from "react"

import {
  SNavigationMenuContent,
  SNavigationMenuItem,
  SNavigationMenuLink,
  SNavigationMenuList,
  SNavigationMenuRoot,
  SNavigationMenuTrigger,
} from "./NavigationMenu.styled"

const NavigationMenu: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.Root>
> = ({
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) => {
  return <SNavigationMenuRoot {...props}>{children}</SNavigationMenuRoot>
}

const NavigationMenuList: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.List> & {
    ref?: React.Ref<HTMLUListElement>
  }
> = (props) => {
  return <SNavigationMenuList {...props} ref={props.ref} />
}

const NavigationMenuItem: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.Item>
> = (props) => {
  return <SNavigationMenuItem {...props} />
}

const NavigationMenuTrigger: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>
> = ({ children, ...props }) => {
  return <SNavigationMenuTrigger {...props}>{children}</SNavigationMenuTrigger>
}

const NavigationMenuContent: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.Content>
> = (props) => {
  return <SNavigationMenuContent {...props} />
}

const NavigationMenuLink: React.FC<
  React.ComponentProps<typeof NavigationMenuPrimitive.Link>
> = (props) => <SNavigationMenuLink {...props} />

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
}
