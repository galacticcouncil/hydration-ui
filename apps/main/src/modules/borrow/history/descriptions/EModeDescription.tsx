import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { eModeCategories } from "@galacticcouncil/money-market-v2/core"
import { useReserveSummaries } from "@galacticcouncil/money-market-v2/react"
import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useBorrowHistoryRoute } from "@/modules/borrow/history/BorrowHistoryFilter.utils"

type Props = {
  readonly categoryId: number | null | undefined
}

// each money market keeps its e-mode labels behind its own provider
export const EModeDescription: FC<Props> = (props) =>
  useBorrowHistoryRoute() === "/money-market/history" ? (
    <EModeDescriptionV2 {...props} />
  ) : (
    <EModeDescriptionV1 {...props} />
  )

const EModeDescriptionV1: FC<Props> = ({ categoryId }) => {
  const { eModes } = useMoneyMarketData()

  return (
    <EModeDescriptionView
      categoryId={categoryId}
      emode={eModes?.[categoryId ?? 0]?.label}
    />
  )
}

const EModeDescriptionV2: FC<Props> = ({ categoryId }) => {
  const emode = eModeCategories(useReserveSummaries().data ?? []).find(
    (category) => category.id === categoryId,
  )?.label

  return <EModeDescriptionView categoryId={categoryId} emode={emode} />
}

const EModeDescriptionView: FC<Props & { emode: string | undefined }> = ({
  categoryId,
  emode,
}) => {
  const { t } = useTranslation(["borrow"])

  if (categoryId === null || categoryId === undefined) {
    return (
      <Text fs="p4" color={getToken("text.high")}>
        {t("borrow:history.table.emodeUpdated")}
      </Text>
    )
  }

  const isEnabled = categoryId !== 0

  return (
    <Flex
      align="center"
      gap="s"
      justify={["end", "start"]}
      sx={{ flexWrap: "wrap" }}
    >
      <Text fs="p4" color={getToken("text.high")}>
        <Trans
          t={t}
          i18nKey={
            isEnabled
              ? "borrow:history.table.emodeEnabled"
              : "borrow:history.table.emodeDisabled"
          }
          values={{ emode }}
        >
          <Text as="span" sx={{ whiteSpace: "nowrap" }} />
          <Text
            as="span"
            color={getToken(
              isEnabled
                ? "accents.success.emphasis"
                : "accents.danger.emphasis",
            )}
          />
        </Trans>
      </Text>
    </Flex>
  )
}
