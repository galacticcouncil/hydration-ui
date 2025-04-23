import { useTranslation } from "react-i18next"

import { useCsvDownload } from "@/hooks/useCsvDownload"
import { TransactionMock } from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { useAssets } from "@/providers/assetsProvider"

export const useDownloadTransactionsCsv = (
  data: ReadonlyArray<TransactionMock>,
) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const csvData = data.map((transaction) => {
    const asset = getAssetWithFallback(transaction.assetId)

    return {
      ...transaction,
      assetSymbol: asset.symbol,
    }
  })

  return useCsvDownload(csvData, {
    filename: "transactions.csv",
    filenameDatetime: true,
    columns: [
      {
        key: "type",
        header: t("type"),
      },
      {
        key: "timestamp",
        header: t("date"),
      },
      {
        key: "amount",
        header: t("amount"),
      },
      {
        key: "assetSymbol",
        header: t("asset"),
      },
      {
        key: "addressFrom",
        header: t("source"),
      },
      {
        key: "addressTo",
        header: t("destination"),
      },
    ],
  })
}
