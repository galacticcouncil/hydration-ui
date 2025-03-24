import { FileDown } from "@galacticcouncil/ui/assets/icons"
import { Button, Combobox, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  TransactionMock,
  transactionTypesMock,
} from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { useDownloadTransactionsCsv } from "@/modules/wallet/transactions/WalletTransactionsTableHeader.utils"

const transactionFilterItems = transactionTypesMock.map((type) => ({
  key: type,
  label: type.slice(0, 1).toUpperCase() + type.slice(1),
}))

type Props = {
  readonly data: ReadonlyArray<TransactionMock>
}

export const WalletTransactionsTableHeader: FC<Props> = ({ data }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  const { type } = useSearch({
    from: "/_wallet/wallet/transactions",
  })

  const navigate = useNavigate()
  const downloadCsv = useDownloadTransactionsCsv(data)

  return (
    <Flex
      px={20}
      py={getTokenPx("scales.paddings.m")}
      justify="space-between"
      align="center"
    >
      <Combobox
        items={transactionFilterItems}
        placeholder={t("common:showAll")}
        label={t("wallet:transactions.type.label")}
        selectedItems={type}
        onSelectionChange={(type) =>
          navigate({
            from: "/wallet/transactions",
            search: {
              type:
                type.length === 0 ||
                type.length === transactionFilterItems.length
                  ? undefined
                  : [...type],
            },
          })
        }
      />
      <Button
        variant="accent"
        outline
        iconStart={FileDown}
        onClick={() => downloadCsv()}
      >
        {isMobile ? t("common:csv") : t("common:downloadCsv")}
      </Button>
    </Flex>
  )
}
