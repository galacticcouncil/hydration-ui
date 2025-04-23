import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import React from "react"

import { SContainer } from "./Breadcrumb.styled"

type BreadcrumbProps = {
  crumbs: { label: string; path: string }[]
}

export const Breadcrumb = ({ crumbs }: BreadcrumbProps) => {
  return (
    <SContainer gap={8} align="center">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index === crumbs.length - 1 ? (
            <Text
              color={getToken("text.high")}
              transform="uppercase"
              fw={500}
              fs={11}
            >
              {crumb.label}
            </Text>
          ) : (
            <Text
              color={getToken("text.low")}
              fs={11}
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
            <Text fs={11} color={getToken("icons.soft")} fw={500}>
              /
            </Text>
          )}
        </React.Fragment>
      ))}
    </SContainer>
  )
}
