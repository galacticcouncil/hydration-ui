import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Alert, Box, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

const SInfoAlert = styled(Alert)`
  width: 100%;
  box-sizing: border-box;
`

/**
 * Persistent info callout for the Limit tab: intent-based limit orders are
 * solver-matched, so execution at the exact specified price is not
 * guaranteed when the market crosses it.
 */
export const LimitWarning: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <Box width="100%" minWidth={0}>
      <SInfoAlert
        variant="info"
        description={
          <Text fs="p5" lh="m" color={getToken("text.high")}>
            {t("limit.warning.message")}{" "}
            {/* TODO: wire the More Info link to docs once the URL is
                finalized. */}
            <SMoreInfo>{t("limit.warning.moreInfo")}</SMoreInfo>
          </Text>
        }
      />
    </Box>
  )
}

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
