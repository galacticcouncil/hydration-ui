import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus } from "lucide-react"
import { Fragment, ReactNode, useState } from "react"

import { Flex, Grid, Icon, Text } from "@/components"
import { getToken } from "@/utils"

import { Button, ButtonProps, LoadingButton } from "./Button"
import { LoadingMode } from "./Button.styled"

type Variant = NonNullable<ButtonProps["variant"]>
type Size = NonNullable<ButtonProps["size"]>

const VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
  "emphasis",
  "accent",
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
  "muted",
  "transparent",
  "ghost",
] satisfies Variant[]

const SIZES = ["large", "medium", "small", "micro"] satisfies Size[]

const meta = {
  component: Button,
  args: {
    children: "Button",
    variant: "primary",
    size: "medium",
    outline: false,
    glow: false,
    uppercase: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    outline: { control: "boolean" },
    glow: { control: "boolean" },
    uppercase: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

const Label = ({ children }: { children: ReactNode }) => (
  <Text fs="p6" color={getToken("text.medium")}>
    {children}
  </Text>
)

type MatrixProps<R extends string> = {
  rows: readonly R[]
  columns: Record<string, (row: R) => ReactNode>
  /** Puts `rows` across the top and `columns` down the side. */
  transposed?: boolean
}

const Matrix = <R extends string>({
  rows,
  columns,
  transposed,
}: MatrixProps<R>) => (
  <Grid
    columnTemplate={`auto repeat(${transposed ? rows.length : Object.keys(columns).length}, max-content)`}
    gap="xl"
    align="center"
    justifyContent="start"
    justifyItems="start"
  >
    <span />
    {(transposed ? rows : Object.keys(columns)).map((heading) => (
      <Label key={heading}>{heading}</Label>
    ))}
    {transposed
      ? Object.entries(columns).map(([column, cell]) => (
          <Fragment key={column}>
            <Label>{column}</Label>
            {rows.map((row) => (
              <Fragment key={row}>{cell(row)}</Fragment>
            ))}
          </Fragment>
        ))
      : rows.map((row) => (
          <Fragment key={row}>
            <Label>{row}</Label>
            {Object.entries(columns).map(([column, cell]) => (
              <Fragment key={column}>{cell(row)}</Fragment>
            ))}
          </Fragment>
        ))}
  </Grid>
)

export const Default: Story = {}

export const Variants: Story = {
  render: ({ size }) => (
    <Matrix
      rows={VARIANTS}
      columns={{
        Solid: (variant) => (
          <Button variant={variant} size={size}>
            Button
          </Button>
        ),
        Glow: (variant) => (
          <Button variant={variant} size={size} glow>
            Button
          </Button>
        ),
        Outline: (variant) => (
          <Button variant={variant} size={size} outline>
            Button
          </Button>
        ),
        "Outline glow": (variant) => (
          <Button variant={variant} size={size} outline glow>
            Button
          </Button>
        ),
        Disabled: (variant) => (
          <Button variant={variant} size={size} disabled>
            Button
          </Button>
        ),
        "Outline disabled": (variant) => (
          <Button variant={variant} size={size} outline disabled>
            Button
          </Button>
        ),
        Icons: (variant) => (
          <Button
            variant={variant}
            size={size}
            iconStart={Plus}
            iconEnd={ArrowRight}
          >
            Button
          </Button>
        ),
        "Icon only": (variant) => (
          <Flex gap="base">
            <Button
              variant={variant}
              size={size}
              icon={Plus}
              aria-label="Add"
            />
            <Button
              variant={variant}
              size={size}
              icon={Plus}
              outline
              aria-label="Add"
            />
          </Flex>
        ),
      }}
    />
  ),
}

export const Sizes: Story = {
  render: () => (
    <Matrix
      rows={VARIANTS}
      columns={Object.fromEntries(
        SIZES.map((size) => [
          size,
          (variant: Variant) => (
            <Flex gap="base" align="center">
              <Button variant={variant} size={size} iconStart={Plus}>
                Button
              </Button>
              <Button variant={variant} size={size} iconStart={Plus} outline>
                Button
              </Button>
              <Button
                variant={variant}
                size={size}
                icon={Plus}
                aria-label="Add"
              />
            </Flex>
          ),
        ]),
      )}
    />
  ),
}

export const Content: Story = {
  render: ({ variant, outline }) => {
    const props = { variant, outline }

    return (
      <Matrix
        rows={SIZES}
        columns={{
          Label: (size) => (
            <Button {...props} size={size}>
              Button
            </Button>
          ),
          Uppercase: (size) => (
            <Button {...props} size={size} uppercase>
              Button
            </Button>
          ),
          "Icon start": (size) => (
            <Button {...props} size={size} iconStart={Plus}>
              Button
            </Button>
          ),
          "Icon end": (size) => (
            <Button {...props} size={size} iconEnd={ArrowRight}>
              Button
            </Button>
          ),
          Both: (size) => (
            <Button
              {...props}
              size={size}
              iconStart={Plus}
              iconEnd={ArrowRight}
            >
              Button
            </Button>
          ),
          "Icon only": (size) => (
            <Button {...props} size={size} icon={Plus} aria-label="Add" />
          ),
          "Link (asChild)": (size) => (
            <Button {...props} size={size} iconEnd={ArrowRight} asChild>
              <a href="#">Link</a>
            </Button>
          ),
          // icons passed as children keep the size, without the optical shift
          "Child svg": (size) => (
            <Button {...props} size={size}>
              <Plus />
              Button
            </Button>
          ),
          "Child Icon": (size) => (
            <Button {...props} size={size}>
              <Icon component={Plus} size="m" />
              Button
            </Button>
          ),
        }}
      />
    )
  },
}

const LOADING_MODES = ["inline", "replace"] satisfies LoadingMode[]

const LoadingTemplate = ({ size }: Pick<ButtonProps, "size">) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Flex direction="column" gap="xl" align="start">
      <Button
        variant="tertiary"
        onClick={() => setIsLoading((value) => !value)}
      >
        Toggle loading
      </Button>
      <Matrix
        transposed
        rows={LOADING_MODES}
        columns={{
          Toggled: (loadingMode) => (
            <LoadingButton
              isLoading={isLoading}
              loadingMode={loadingMode}
              size={size}
            >
              Sign Transaction
            </LoadingButton>
          ),
          "Toggled, fixed width": (loadingMode) => (
            <LoadingButton
              isLoading={isLoading}
              loadingMode={loadingMode}
              size={size}
              width={240}
            >
              Sign Transaction
            </LoadingButton>
          ),
          "Toggled, icon": (loadingMode) => (
            <LoadingButton
              isLoading={isLoading}
              loadingMode={loadingMode}
              size={size}
              iconStart={Plus}
            >
              Add liquidity
            </LoadingButton>
          ),
          Loading: (loadingMode) => (
            <LoadingButton isLoading loadingMode={loadingMode} size={size}>
              Sign Transaction
            </LoadingButton>
          ),
          "Loading, own variant": (loadingMode) => (
            <LoadingButton
              isLoading
              loadingMode={loadingMode}
              loadingVariant="primary"
              size={size}
            >
              Sign Transaction
            </LoadingButton>
          ),
          "Loading, faded": (loadingMode) => (
            <LoadingButton
              isLoading
              loadingMode={loadingMode}
              loadingVariant="primary"
              loadingFade
              size={size}
            >
              Sign Transaction
            </LoadingButton>
          ),
          Disabled: (loadingMode) => (
            <LoadingButton
              isLoading={isLoading}
              loadingMode={loadingMode}
              size={size}
              disabled
            >
              Sign Transaction
            </LoadingButton>
          ),
          "Disabled, muted": (loadingMode) => (
            <LoadingButton
              isLoading={isLoading}
              loadingMode={loadingMode}
              size={size}
              disabled
              disabledVariant="muted"
            >
              Sign Transaction
            </LoadingButton>
          ),
        }}
      />
    </Flex>
  )
}

export const Loading: Story = {
  render: ({ size }) => <LoadingTemplate size={size} />,
}
