import { Meta, StoryFn } from "@storybook/react-vite"

import {
  ArrowRight,
  BracesIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  IconPlaceholder,
  SettingsIcon,
} from "@/assets/icons"
import { Button } from "@/components/Button"
import { CopyButton } from "@/components/CopyButton"
import { ExternalLink } from "@/components/ExternalLink"
import { Flex } from "@/components/Flex"
import {
  MenuItem,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemIcon,
} from "@/components/Menu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContentDivider,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu.styled"

export default {
  title: "components/DropdownMenu",
} satisfies Meta

export const Default: StoryFn = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        iconStart={SettingsIcon}
        iconEnd={ChevronDownIcon}
        variant="secondary"
        size="medium"
      >
        Settings
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem asChild>
        <MenuSelectionItem>
          <MenuItemIcon component={IconPlaceholder} />
          <MenuItemLabel>Item 1</MenuItemLabel>
          <MenuSelectionItemIcon component={ArrowRight} />
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuItem>
          <MenuItemIcon component={IconPlaceholder} />
          <MenuItemLabel>Item 2</MenuItemLabel>
          <MenuItemDescription>Description</MenuItemDescription>
        </MenuItem>
      </DropdownMenuItem>
      <DropdownMenuContentDivider />
      <DropdownMenuItem asChild>
        <MenuItem>
          <MenuItemLabel>Item 3</MenuItemLabel>
        </MenuItem>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const LinksAndActions: StoryFn = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button iconStart={CopyIcon} variant="tertiary" size="small">
        Copy
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={0}>
      <DropdownMenuItem asChild>
        <MenuSelectionItem asChild variant="filterLink">
          <CopyButton text={JSON.stringify({ hello: "world" }, null, 2)}>
            {({ copied }) => (
              <>
                <MenuItemIcon
                  size="m"
                  component={copied ? CheckIcon : BracesIcon}
                />
                <MenuItemLabel>Copy JSON</MenuItemLabel>
              </>
            )}
          </CopyButton>
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem asChild variant="filterLink">
          <ExternalLink href="https://hydration.net">
            <MenuItemIcon size="m" component={ExternalLinkIcon} />
            <MenuItemLabel>Open in explorer</MenuItemLabel>
          </ExternalLink>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const Animations: StoryFn = () => (
  <Flex gap="m">
    {(["bottom", "top", "right", "left", "slide-bottom"] as const).map(
      (animation) => (
        <DropdownMenu key={animation}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="small">
              {animation}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            {...(animation === "slide-bottom"
              ? { animation, side: "top" }
              : { side: animation })}
          >
            <DropdownMenuItem asChild>
              <MenuSelectionItem>
                <MenuItemLabel>Item 1</MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <MenuSelectionItem>
                <MenuItemLabel>Item 2</MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    )}
  </Flex>
)

export const Sizes: StoryFn = () => (
  <Flex gap="m">
    {(["small", "medium", "large"] as const).map((size) => (
      <DropdownMenu key={size}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="small">
            {size}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent size={size} align="start">
          <DropdownMenuItem asChild>
            <MenuSelectionItem>
              <MenuItemIcon component={IconPlaceholder} />
              <MenuItemLabel>Item 1</MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <MenuSelectionItem>
              <MenuItemIcon component={IconPlaceholder} />
              <MenuItemLabel>Item 2</MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ))}
  </Flex>
)

export const FullWidth: StoryFn = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary" size="medium">
        More
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent fullWidth animation="slide-bottom">
      <DropdownMenuItem asChild>
        <MenuSelectionItem>
          <MenuItemIcon component={IconPlaceholder} />
          <MenuItemLabel>Item 1</MenuItemLabel>
          <MenuSelectionItemIcon component={ArrowRight} />
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem>
          <MenuItemIcon component={IconPlaceholder} />
          <MenuItemLabel>Item 2</MenuItemLabel>
          <MenuSelectionItemIcon component={ArrowRight} />
        </MenuSelectionItem>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
