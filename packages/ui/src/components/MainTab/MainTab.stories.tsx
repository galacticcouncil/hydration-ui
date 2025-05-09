import { Meta, StoryFn } from "@storybook/react"
import { Plus } from "lucide-react"

import { Grid } from "@/components/Grid"
import { MainTab } from "@/components/MainTab"

export default {
  component: MainTab,
} satisfies Meta<typeof MainTab>

const hasIcon = [true, false] as const
const isActive = [true, false] as const

export const Default: StoryFn = () => {
  return (
    <Grid columnTemplate="auto auto" columnGap={8} rowGap={2}>
      {hasIcon.map((hasIcon) => {
        return isActive.flatMap((isActive) => {
          const content = [hasIcon ? "Icon" : null, isActive ? "Active" : null]
            .filter(Boolean)
            .join(" ")

          return (
            <MainTab
              key={`${hasIcon}-${isActive}`}
              icon={hasIcon ? Plus : undefined}
              isActive={isActive}
            >
              {content}
            </MainTab>
          )
        })
      })}
    </Grid>
  )
}
