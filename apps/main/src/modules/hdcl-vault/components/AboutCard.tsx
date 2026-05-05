import { Button, Flex, Paper, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

/**
 * About / Risk-management collapsible card — Figma 6402:24464 left column bottom.
 *
 * Default expanded; "Hide ⌃" toggle collapses to header only.
 *
 * TODO Phase 7: replace the manual toggle with the project's `Collapsible`
 * primitive (the namespace API didn't match my first attempt — needs a closer
 * look at Collapsible/index.ts to use the trigger+content pattern correctly).
 */
export const AboutCard = () => {
  const { t } = useTranslation("hdcl")
  const [open, setOpen] = useState(true)

  return (
    <Paper variant="plain" p={20}>
      <Flex justify="space-between" align="center">
        <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
          {t("about.heading")}
        </Text>
        <Button variant="muted" size="small" onClick={() => setOpen((v) => !v)}>
          {open ? `${t("about.hide")} ⌃` : `${t("about.show")} ⌄`}
        </Button>
      </Flex>

      {open && (
        <Flex direction="column" gap={16} sx={{ mt: "l" }}>
          {t("about.body").split("\n\n").map((para, i) => (
            <Text
              key={i}
              fs="p4"
              color={getToken("text.medium")}
              css={{ lineHeight: 1.5 }}
            >
              {para}
            </Text>
          ))}

          <Separator />

          <Text font="primary" fs="h7" fw={500} color={getToken("text.high")}>
            {t("about.risk.heading")}
          </Text>
          <Text fs="p4" color={getToken("text.medium")} css={{ lineHeight: 1.5 }}>
            {t("about.risk.body")}
          </Text>
        </Flex>
      )}
    </Paper>
  )
}
