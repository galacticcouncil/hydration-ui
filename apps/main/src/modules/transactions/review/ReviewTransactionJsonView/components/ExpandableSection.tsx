import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  ButtonTransparent,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { ThemeUICSSProperties } from "@galacticcouncil/ui/types"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { ExpandableContainer, ExpandButton } from "./ExpandableSection.styled"

export type ExpandableSectionProps = {
  title: string
  children: React.ReactNode
  maxContentHeight?: ThemeUICSSProperties["maxHeight"]
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  maxContentHeight = 120,
}) => {
  const { t } = useTranslation("common")

  const [isSectionExpanded, setIsSectionExpanded] = useState(true)
  const [isContentExpanded, setIsContentExpanded] = useState(
    maxContentHeight === "100%",
  )

  const shouldRenderExpandButton = isSectionExpanded && !isContentExpanded

  return (
    <Box position="relative" px="l" py="m">
      <ButtonTransparent onClick={() => setIsSectionExpanded((prev) => !prev)}>
        <Text
          as="span"
          color={getToken("buttons.primary.medium.rest")}
          fs="p5"
          fw={500}
          mb="s"
          sx={{ display: "flex", alignItems: "center", gap: "s" }}
        >
          <Icon
            size={10}
            sx={{ rotate: isSectionExpanded ? "0" : "-90deg" }}
            component={CaretDown}
          />
          {title}
        </Text>
      </ButtonTransparent>
      <ExpandableContainer
        height={isContentExpanded ? "auto" : maxContentHeight}
        hidden={!isSectionExpanded}
      >
        {children}
      </ExpandableContainer>
      {shouldRenderExpandButton && (
        <ExpandButton
          type="button"
          onClick={() => setIsContentExpanded((prev) => !prev)}
        >
          {t("showMore")}
        </ExpandButton>
      )}
    </Box>
  )
}
