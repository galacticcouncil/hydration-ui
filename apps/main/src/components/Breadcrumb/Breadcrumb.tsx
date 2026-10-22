import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import React from "react"

import { Crumb, useCrumbs } from "@/modules/layout/hooks/useCrumbs"

export type BreadcrumbItem = Crumb

export const Breadcrumb = () => {
  const crumbs = useCrumbs()

  if (crumbs.length < 2) return null

  return (
    <Flex gap="base" align="center">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index === crumbs.length - 1 ? (
            <Text
              color={getToken("text.high")}
              transform="uppercase"
              fw={500}
              fs="p6"
            >
              {crumb.label}
            </Text>
          ) : (
            <Text
              color={getToken("text.low")}
              fs="p6"
              fw={500}
              transform="uppercase"
              decoration="none"
              asChild
              sx={{
                "&:hover": { color: getToken("text.medium") },
              }}
            >
              <Link to={crumb.path}>{crumb.label}</Link>
            </Text>
          )}
          {index < crumbs.length - 1 && (
            <Text fs="p6" color={getToken("icons.soft")} fw={500}>
              /
            </Text>
          )}
        </React.Fragment>
      ))}
    </Flex>
  )
}
