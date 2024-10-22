import { Button } from "components/Button/Button"
import { useCsvDownload } from "hooks/useCsvDownload"
import { useTranslation } from "react-i18next"
import { TTransactionsTableData } from "sections/wallet/transactions/table/data/TransactionsTableData.utils"
import DocumentIcon from "assets/icons/DocumentIcon.svg?react"

export type Props = {
  data: TTransactionsTableData
}

export const TransactionsDownload: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation()

  const download = useCsvDownload(data, {
    filename: "transactions.csv",
    filenameDatetime: true,
    columns: [
      {
        key: "type",
        header: t("wallet.transactions.table.header.type"),
      },
      {
        key: "dateDisplay",
        header: t("wallet.transactions.table.header.date"),
      },
      {
        key: "amountDisplay",
        header: t("wallet.transactions.table.header.amount"),
      },
      {
        key: "assetSymbol",
        header: t("wallet.transactions.table.header.asset"),
      },
      {
        key: "sourceDisplay",
        header: t("wallet.transactions.table.header.source"),
      },
      {
        key: "destDisplay",
        header: t("wallet.transactions.table.header.destination"),
      },
    ],
  })

  return (
    <Button onClick={() => download()} size="micro">
      <DocumentIcon width={18} height={18} sx={{ ml: -6, mr: -8 }} />
      <span sx={{ display: ["none", "inline"] }}>
        {t("wallet.transactions.table.header.download")}
      </span>
      <span sx={{ display: ["inline", "none"] }}>
        {t("wallet.transactions.table.header.csv")}
      </span>
    </Button>
  )
}
