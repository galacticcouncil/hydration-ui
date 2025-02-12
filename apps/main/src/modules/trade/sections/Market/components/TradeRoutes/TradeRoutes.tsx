import { ChevronRight, Routes } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"

type TradeRoutesProps = {
  routes: string[]
}

export const TradeRoutes = ({ routes }: TradeRoutesProps) => {
  const { t } = useTranslation("wallet")
  const routesAmount = routes.length

  const routeComponents = useMemo(() => {
    const elements: ReactNode[] = []

    routes.map((route, index) => {
      const isLast = routesAmount === index + 1

      elements.push(
        <Text key={route} fs="p5" fw={500} color={getToken("text.high")}>
          {route}
        </Text>,
      )

      if (!isLast)
        elements.push(
          <Icon
            key={index}
            size={18}
            component={ChevronRight}
            color={getToken("icons.onContainer")}
          />,
        )
    })

    return elements
  }, [routes, routesAmount])

  return (
    <Flex direction="column" sx={{ pb: 4, pt: 8 }}>
      <Flex justify="space-between">
        <Text
          fs="p4"
          fw={400}
          color={getToken("buttons.primary.high.rest")}
          sx={{ pt: 2 }}
        >
          {t("market.form.routes.label", { count: routesAmount - 1 })}
        </Text>

        <Flex gap={4} align="center">
          <Flex>{routeComponents}</Flex>

          <Icon
            size={"70%"}
            component={Routes}
            color={getToken("buttons.primary.high.rest")}
          />
        </Flex>
      </Flex>
      <Text fs="p6" lh={1} fw={400} color={getToken("text.low")} align="end">
        {t("market.form.routes.desc")}
      </Text>
    </Flex>
  )
}
