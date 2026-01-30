import { css } from "@emotion/react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Grid } from "@/components/Grid"
import { Paper } from "@/components/Paper"
import { containerSize } from "@/styles/container"
import { styled } from "@/utils"

import { ResponsiveScope } from "./ResponsiveScope"

export default {
  component: ResponsiveScope,
} satisfies Meta<typeof ResponsiveScope>

type Story = StoryObj<typeof ResponsiveScope>

const SCard = styled(Paper)(
  ({ theme }) => css`
    display: flex;

    padding: 20px;
    gap: 10px;
    height: 100%;

    flex-direction: column;

    ${containerSize(
      "md",
      css`
        flex-direction: row;
        background: ${theme.colors.azureBlue.alpha[500]};
      `,
    )}
  `,
)

const ResponsiveCard = ({ colSpan }: { colSpan: number }) => (
  <ResponsiveScope sx={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}>
    <SCard>
      <span sx={{ fontWeight: 700, fontSize: 14 }}>Responsive Card</span>
      <span>
        This card adapts to container size using CSS container queries.
      </span>
    </SCard>
  </ResponsiveScope>
)

export const Example: Story = {
  render: () => (
    <Grid gap="xl" columnTemplate="repeat(4, minmax(0, 1fr))">
      <ResponsiveCard colSpan={4} />
      <ResponsiveCard colSpan={2} />
      <ResponsiveCard colSpan={2} />
      <ResponsiveCard colSpan={1} />
      <ResponsiveCard colSpan={2} />
      <ResponsiveCard colSpan={1} />
    </Grid>
  ),
}
