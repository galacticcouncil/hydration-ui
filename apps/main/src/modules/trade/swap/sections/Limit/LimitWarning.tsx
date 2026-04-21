import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

/**
 * Persistent info banner shown below the Limit form submit button.
 * Sets user expectations: intent-based limit orders are solver-matched,
 * so execution at the exact specified price is not guaranteed even when
 * the market crosses it.
 */
export const LimitWarning: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <SWarning align="flex-start" gap="s" py="base">
      <Icon
        component={CircleInfo}
        size="s"
        color={getToken("accents.info.onPrimary")}
      />
      <Text fs="p5" lh="m" color={getToken("text.medium")} sx={{ flex: 1 }}>
        {t("limit.warning.message")}{" "}
        {/* TODO: wire the More Info link to docs once the URL is
            finalized. Kept as inline text for now to match the design. */}
        <SMoreInfo>{t("limit.warning.moreInfo")}</SMoreInfo>
      </Text>
    </SWarning>
  )
}

const SWarning = styled(Flex)(
  ({ theme }) => css`
    border-radius: ${theme.radii.base};
    padding: ${theme.space.m};
    background: ${theme.accents.info.primary};
  `,
)

const SMoreInfo = styled.span(
  ({ theme }) => css`
    color: ${theme.accents.info.onPrimary};
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  `,
)
