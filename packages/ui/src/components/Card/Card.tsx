import { FC } from "react"

import { SCardBody, SCardHeader } from "@/components/Card/Card.styled"
import { Paper } from "@/components/Paper"
import { StackProps } from "@/components/Stack"
import { Text, TextProps } from "@/components/Text"
import { getToken } from "@/utils"

export const Card = Paper

export const CardHeader: FC<StackProps> = (props) => (
  <SCardHeader p="l" gap="s" {...props} />
)

export const CardTitle: FC<TextProps> = (props) => (
  <Text as="h2" font="primary" fs="base" fw={500} {...props} />
)

export const CardDescription: FC<TextProps> = (props) => (
  <Text fs="p5" color={getToken("text.low")} {...props} />
)

export const CardBody = SCardBody
